const roomReadyStates = require("./inviteFriend"); // 공유된 roomReadyStates 불러오기
const roomCounts = require("./inviteFriend");
const Challenge = require("../models/challenge");
const Friend = require("../models/friend");
const Character = require("../models/character");

function startChallenge(io, socket) {
  socket.on("startWebRTC", ({ roomId }) => {
    console.log(`startWebRTC 이벤트 수신: 방 ${roomId}`);
    // 방에 있는 사용자들에게 신호를 보냄
    io.to(roomId).emit("startWebRTC", { roomId });
  });

  socket.on("offer", ({ offer, roomId }) => {
    console.log(`offer 수신: 방 ${roomId}`);
    // 방의 다른 사용자에게 offer 전달
    socket.to(roomId).emit("offer", { offer, roomId });
  });

  socket.on("answer", ({ answer, roomId }) => {
    console.log(`answer 수신: 방 ${roomId}`);
    // 방의 다른 사용자에게 answer 전달
    socket.to(roomId).emit("answer", { answer, roomId });
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    console.log(`ICE 후보 수신: 방 ${roomId}`);
    // 방의 다른 사용자에게 ICE 후보 전달
    socket.to(roomId).emit("ice-candidate", { candidate, roomId });
  });
  // 점프잭 카운트 업데이트
  socket.on("updateCount", ({ roomId, count }) => {
    if (!roomCounts[roomId]) {
      roomCounts[roomId] = {};
    }
    roomCounts[roomId][socket.userId] = count;

    console.log(
      `사용자 ${socket.userId}의 점프잭 카운트가 ${count}로 업데이트됨 (방: ${roomId})`
    );

    console.log(roomCounts[roomId]);

    socket.to(roomId).emit("updatedCount", {
      userId: socket.userId,
      count,
    });
  });

  socket.on("ready", ({ roomId }) => {
    console.log(`${socket.userId}님이 방 ${roomId}에서 준비 완료`);

    if (!roomReadyStates[roomId]) {
      console.error(`방 ${roomId} 상태가 초기화되지 않았습니다.`);
      roomReadyStates[roomId] = {}; // 상태 초기화
    }

    // 현재 사용자를 준비 상태로 설정
    roomReadyStates[roomId][socket.userId] = true;

    // 방의 사용자 목록 가져오기
    const roomUsers = Object.keys(roomReadyStates[roomId]); // roomReadyStates 기준

    // 모든 사용자가 준비되었는지 확인
    const allReady =
      roomUsers.length === 2 && // 방에 사용자가 두 명이어야 하고
      roomUsers.every((user) => roomReadyStates[roomId][user] === true); // 두 명 모두 준비 상태여야 함

    if (allReady) {
      console.log(`방 ${roomId}의 모든 사용자가 준비 완료. 카운트다운 시작.`);
      io.to(roomId).emit("startCountdown"); // 카운트다운 시작 이벤트 전송
    } else {
      console.log(
        `방 ${roomId}: 일부 사용자 준비 중. 현재 상태:`,
        roomReadyStates[roomId]
      );
      socket.to(roomId).emit("opponentReady", { userId: socket.userId });
    }
  });

  socket.on("disconnectFromChallenge", async ({ roomId }) => {
    console.log(`${socket.userId}님이 방 ${roomId}에서 나갔습니다.`);
    socket.leave(roomId);
    io.to(roomId).emit("userLeft");

    try {
      // roomId에서 챌린저와 챌린지드 ID 추출
      const [challengerId, challengedId] = roomId.split("-");

      const matchData = await Challenge.findOne({
        challengerId,
        challengedId,
        status: "accepted",
      }).sort({ createdAt: -1 });

      if (!matchData) {
        console.error(`해당 데이터를 찾을 수 없습니다. (방: ${roomId})`);
      } else {
        // status를 declined로 업데이트
        matchData.status = "declined";
        await matchData.save();
        console.log(
          `DB 상태 변경 성공: 방 ${roomId}, 업데이트된 데이터:`,
          matchData
        );
      }
    } catch (error) {
      console.error(
        `DB 상태 변경 실패: 방 ${roomId}, 에러 메시지:`,
        error.message
      );
    }

    setTimeout(() => {
      io.socketsLeave(roomId);
      delete roomCounts[roomId];
      delete roomReadyStates[roomId];
      console.log(
        `방 ${roomId}의 모든 소켓이 제거되고 상태가 초기화되었습니다.`
      );
    }, 5000);
  });

  const processedRooms = new Set(); // 처리된 방(roomId)을 저장하는 Set 객체

  socket.on("endChallenge", async ({ roomId, userId }) => {
    console.log(`방 ${roomId}에서 대결이 종료되었습니다.`);

    if (processedRooms.has(roomId)) {
      console.log(`방 ${roomId}의 대결은 이미 처리되었습니다.`);
      return; // 이미 처리된 방이면 실행하지 않음
    }

    processedRooms.add(roomId); // 방을 처리된 상태로 표시
    console.log(`방 ${roomId}에서 대결 종료 이벤트 처리 시작.`);

    try {
      // roomCounts에서 해당 방의 점수 데이터 가져오기
      const results = roomCounts[roomId];
      if (!results) {
        console.error(`방 ${roomId}의 대결 결과를 찾을 수 없습니다.`);
        return;
      }

      // 결과 계산
      const scores = Object.entries(results); // results: { userId1: score1, userId2: score2 }
      scores.sort((a, b) => b[1] - a[1]); // 점수 내림차순 정렬

      let winnerMessage = "";
      if (scores[0][1] === scores[1][1]) {
        // 무승부
        winnerMessage = "무승부";
      } else {
        // 승자 결정
        winnerMessage = `${scores[0][0]}님이 승리하셨습니다!`; // 최고 점수의 사용자
      }

      // 결과 로그
      console.log(`최종 스코어:`, results);
      console.log(`결과 메시지: ${winnerMessage}`);

      // 클라이언트로 결과 전송
      io.to(roomId).emit("challengeEnded", {
        message: "대결이 종료되었습니다.",
        scores: results, // 최종 점수
        resultMessage: winnerMessage,
      });

      const [challengerId, challengedId] = roomId.split("-"); // roomId에서 challenger와 challenged 추출
      const winnerId = scores[0][0]; // 승자 ID
      const loserId = scores[1][0]; // 패자 ID
      const isDraw = scores[0][1] === scores[1][1]; // 무승부 여부 확인
      const challengerScore = roomCounts[roomId][challengerId]; // challenger 점수
      const challengedScore = roomCounts[roomId][challengedId]; // challenged 점수

      // ✅ 1. Challenge 컬렉션에 대결 결과 저장
      const matchData = await Challenge.findOne(
        { challengerId, challengedId, status: "accepted" } // challengerId와 challengedId 기준
      ).sort({ createdAt: -1 }); // 최신 데이터 정렬

      if (!matchData) {
        console.error(`해당 데이터를 찾을 수 없습니다. (방: ${roomId})`);
      } else {
        const updatedChallenge = await Challenge.updateOne(
          { _id: matchData._id }, // 특정 ID로 업데이트
          {
            scores: { challengerScore, challengedScore }, // 점수 저장
            winnerId: isDraw ? null : winnerId, // 무승부라면 winnerId는 null
            status: "completed", // 상태를 'completed'로 설정
          },
          {
            new: true, // 업데이트된 문서를 반환
            upsert: false, // 없으면 생성하지 않음
            sort: { createdAt: -1 }, // 최신 데이터 기준으로 정렬
          }
        );

        console.log("Challenge 업데이트 완료:", updatedChallenge);
      }

      if (isDraw) {
        const challengerFriend = await Friend.findOne({ id: challengerId });
        const challengedFriend = await Friend.findOne({ id: challengedId });
      
        if (!challengerFriend || !challengedFriend) {
          throw new Error("One or both friends not found for draw update.");
        }
      
        challengerFriend.draw = (challengerFriend.draw || 0) + 1;
        challengedFriend.draw = (challengedFriend.draw || 0) + 1;
      
        await challengerFriend.save();
        await challengedFriend.save();
        console.log(`Draw stats updated for ${challengerId} and ${challengedId}`);
      } else {
        console.log("승패가 결정되었습니다.");
        console.log("승자 ID:", winnerId);
        console.log("패자 ID:", loserId);
        console.log("사용자 ID:", userId);
      
        if (String(winnerId) === String(userId)) {
          console.log("승자 업데이트 시작");
          const winnerFriend = await Friend.findOne({ id: winnerId });
          if (!winnerFriend) {
            throw new Error(`Friend with id ${winnerId} not found.`);
          }
      
          winnerFriend.win = (winnerFriend.win || 0) + 1;
      
          const winnerCharacter = await Character.findOne({ id: winnerId });
          if (winnerCharacter) {
            winnerCharacter.coin = (winnerCharacter.coin || 0) + 3;
            await winnerCharacter.save();
          } else {
            console.error("Winner character not found.");
          }
      
          await winnerFriend.save();
          console.log(`Winner stats updated: ${winnerId}`);
        } else if (String(loserId) === String(userId)) {
          console.log("패자 업데이트 시작");
          const loserFriend = await Friend.findOne({ id: loserId });
          if (!loserFriend) {
            throw new Error(`Friend with id ${loserId} not found.`);
          }
      
          loserFriend.lose = (loserFriend.lose || 0) + 1;
      
          const loserCharacter = await Character.findOne({ id: loserId });
          if (loserCharacter) {
            loserCharacter.coin = (loserCharacter.coin || 0) - 3;
            await loserCharacter.save();
          } else {
            console.error("Loser character not found.");
          }
      
          await loserFriend.save();
          console.log(`Loser stats updated: ${loserId}`);
        } else {
          console.error("사용자가 승자도 패자도 아닙니다.");
        }
      }


    } catch (error) {
      console.error(`대결 결과 저장 중 에러 발생: ${error.message}`);
    }
    // 방 상태 정리
    setTimeout(() => {
      processedRooms.delete(roomId); // 일정 시간이 지난 후 방 처리 상태 초기화
      io.socketsLeave(roomId);
      delete roomCounts[roomId];
      delete roomReadyStates[roomId];
      console.log(
        `방 ${roomId}의 모든 소켓이 제거되고 상태가 초기화되었습니다.`
      );
    }, 5000);
  });
}

module.exports = { startChallenge, roomCounts };
