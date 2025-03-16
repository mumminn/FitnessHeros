const users = {}; // 사용자 ID와 소켓 ID 매핑을 저장하는 객체
const activeChallenges = {}; // 대결 신청을 추적하는 객체
const roomReadyStates = {}; // 방별 준비 상태 저장
const roomCounts = {};
const Challenge = require("../models/challenge");

function handleChallenge(io, socket) {
  const userId = socket.userId;

  socket.on("sendChallenge", async (data) => {
    console.log("sendChallenge 이벤트 수신:", data); // 디버깅용
    const { friendId } = data;

    if (!friendId) {
      console.error("friendId가 없습니다.");
      return;
    }

    if (io.users[friendId]) {
      const roomId = `${userId}-${friendId}`; // roomId 생성
      socket.join(roomId); // 초대한 사용자도 roomId에 참가
      console.log(`${userId}님이 방 ${roomId}에 참가했습니다.`);

      // 대결 튜플 생성
      try {
        const existingChallenge = await Challenge.findOne({
          challengerId: userId,
          challengedId: friendId,
          status: "pending",
        });

        if (existingChallenge) {
          socket.emit("error", {
            message: "이미 대결 신청이 진행 중입니다.",
          });
          return;
        }

        // 친구의 가장 최근 대결 확인
        const latestFriendChallenge = await Challenge.findOne({
          $or: [{ challengedId: friendId }, { challengerId: friendId }],
        }).sort({ createdAt: -1 });

        if (
          latestFriendChallenge &&
          latestFriendChallenge.status === "accepted"
        ) {
          socket.emit("error", {
            message:
              "현재 상대가 대결중입니다. 잠시 후에 다시 대결을 신청해주세요.",
          });

          // 친구가 이미 대결 중임을 클라이언트에 알림
          io.to(io.users[userId]).emit("friendStatusUpdate", {
            friendId,
            isInChallenge: true,
          });

          return;
        }

        const challenge = new Challenge({
          challengerId: userId,
          challengedId: friendId,
          status: "pending",
          createdAt: new Date(),
        });
        await challenge.save();
        console.log("대결 튜플 생성 완료:", challenge);

        // 상대방에게 대결 요청 전송
        io.to(io.users[friendId]).emit("challengeReceived", {
          from: userId,
          roomId, // roomId도 함께 전송
        });

        // 30초 후 상태 확인 및 자동 거절 처리
        setTimeout(async () => {
          const currentChallenge = await Challenge.findOne({
            challengerId: userId,
            challengedId: friendId,
            status: "pending", // 여전히 대기 상태인 경우
          });

          if (currentChallenge) {
            currentChallenge.status = "declined"; // 상태를 "declined"로 변경
            await currentChallenge.save();
            console.log(
              `대결 신청이 자동으로 거절되었습니다: ${userId} -> ${friendId}`
            );

            // 대결 취소 알림 전송
            io.to(io.users[userId]).emit("challengeCancelled", {
              message: `${friendId}님이 응답하지 않아 대결이 자동으로 취소되었습니다.`,
            });
            io.to(io.users[friendId]).emit("challengeCancelled", {
              message: `${userId}님의 대결 신청이 자동으로 취소되었습니다.`,
            });

            // 방에서 소켓 제거
            io.socketsLeave(roomId);
          }
        }, 30 * 1000); // 30초 타이머
      } catch (error) {
        console.error("대결 튜플 생성 중 오류 발생:", error);
        socket.emit("error", { message: "대결 생성에 실패했습니다." });
        return;
      }
    } else {
      socket.emit("error", { message: "Friend is offline" });
      console.log(`${friendId}님은 현재 온라인이 아닙니다.`);
    }
  });

  socket.on("acceptChallenge", async ({ roomId }) => {
    console.log("received acceptChallenge");
    try {
      await Challenge.updateOne(
        {
          challengerId: roomId.split("-")[0],
          challengedId: roomId.split("-")[1],
          status: "pending",
        },
        { status: "accepted", acceptedAt: new Date() }
      );
      io.to(roomId).emit("gameStart", { roomId });
    } catch (error) {
      console.error("대결 수락 처리 중 오류 발생:", error);
      socket.emit("error", { message: "대결 수락에 실패했습니다." });
    }
  });

  socket.on("declineChallenge", async ({ roomId }) => {
    console.log("received declineChallenge");

    try {
      await Challenge.updateOne(
        {
          challengerId: roomId.split("-")[0],
          challengedId: roomId.split("-")[1],
          status: "pending",
        },
        { status: "declined" }
      );
      io.to(roomId).emit("challengeDeclined", {
        message: "대결이 성사되지 않았습니다.",
      });
      io.socketsLeave(roomId); // 방에 있는 모든 소켓을 방에서 제거

      console.log(`대결 거절로 인해 방 ${roomId}이 삭제되었습니다.`);
    } catch (error) {
      console.error("대결 거절 처리 중 오류 발생:", error);
      socket.emit("error", { message: "대결 거절에 실패했습니다." });
    }
  });

  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log(`${socket.userId}님이 방 ${roomId}에 참가했습니다.`);
    // 방 상태 초기화 (두 명 연결 시 생성)
    if (!roomReadyStates[roomId]) {
      roomReadyStates[roomId] = {};
    }
    if (!roomCounts[roomId]) {
      roomCounts[roomId] = {};
    }
    roomReadyStates[roomId][socket.userId] = false; // 초기 준비 상태는 false
    roomCounts[roomId][socket.userId] = 0; // 초기 카운트는 0

    const totalUsers = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    console.log(`방 ${roomId}에 현재 사용자 수: ${totalUsers}`);

    // 방이 두 명으로 꽉 차면 초기화 상태 출력
    if (totalUsers === 2) {
      console.log(`방 ${roomId}이 두 명으로 채워졌습니다.`);
    }
  });
}

module.exports = {
  handleChallenge,
  users,
  activeChallenges,
  roomReadyStates,
  roomCounts,
};
