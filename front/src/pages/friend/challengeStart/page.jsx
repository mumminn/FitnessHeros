import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Popup from "../../../components/Popup";
import { routes } from "../../../constants/routes";
import SocketContext from "../../../contexts/SocketContext";
import { jwtDecode } from "jwt-decode";
import JumpingJackCounter from "../../../components/JumpingJackCounter";
import "./progressbar.css";

function ChallengeStartPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [isChallenger, setIsChallenger] = useState(false); // 챌린저 여부
  const [opponentLeft, setOpponentLeft] = useState(false); // 상대방이 나갔는지 여부

  const [myId, setMyId] = useState(""); // 자신의 ID
  const [opponentId, setOpponentId] = useState(""); // 상대방의 ID

  const [myCount, setMyCount] = useState(0); // 내 점핑잭 카운트
  const [opponentCount, setOpponentCount] = useState(0); // 상대방 점핑잭 카운트

  const [hideReadyMessage, setHideReadyMessage] = useState(false);
  const [isReady, setIsReady] = useState(false); // 내가 준비되었는지 여부
  const [opponentReady, setOpponentReady] = useState(false); // 상대방 준비 여부
  const [countdown, setCountdown] = useState(0); // 카운트다운 값
  const [canCount, setCanCount] = useState(false); // 점핑잭 카운트 활성화 여부
  const canCountRef = useRef(canCount); // 최신 canCount 상태를 저장

  const [remainingTime, setRemainingTime] = useState(0); // 남은 게임 시간

  const [popupContent, setPopupContent] = useState(null); // 결과 Popup 내용을 저장

  const navigate = useNavigate();
  const { roomId } = useParams(); // roomId 가져오기
  const { socket, isInitialized } = useContext(SocketContext);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: ["stun:hk-turn1.xirsys.com"] },
      {
        username:
          "LYu5J9TTzrX5ZQkgNDYTwQLdDU00ghGXzm5vLdaQVJgi88v_4XvEtKEGnNJOz3sBAAAAAGdW7HZka2d1czczMQ==",
        credential: "13d167f0-b62f-11ef-a116-0242ac120004",
        urls: [
          "turn:hk-turn1.xirsys.com:80?transport=udp",
          "turn:hk-turn1.xirsys.com:3478?transport=udp",
          "turn:hk-turn1.xirsys.com:80?transport=tcp",
          "turn:hk-turn1.xirsys.com:3478?transport=tcp",
          "turns:hk-turn1.xirsys.com:443?transport=tcp",
          "turns:hk-turn1.xirsys.com:5349?transport=tcp",
        ],
      },
    ],
  };
  useEffect(() => {
    console.log("canCount 상태 변화:", canCount);
  }, [canCount]);

  useEffect(() => {
    canCountRef.current = canCount; // 상태가 업데이트될 때마다 ref에 저장
  }, [canCount]);

  useEffect(() => {
    if (!isInitialized || !socket) return;

    const handleStartCountdown = () => {
      console.log("Countdown started");
      // 처리 로직
    };

    socket.on("startCountdown", handleStartCountdown);

    return () => {
      socket.off("startCountdown", handleStartCountdown); // 정리
    };
  }, [isInitialized, socket]);

  useEffect(() => {
    if (!isInitialized) {
      console.log("Socket is not initialized yet.");
      return;
    }

    if (!socket) {
      console.error("Socket is not available.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate(routes.login);
      return;
    }

    // 토큰에서 사용자 ID 추출
    const decoded = jwtDecode(token);
    const userId = decoded.id;
    setMyId(userId);

    // roomId에서 챌린저와 챌린지드 구분
    const [challengerId, challengedId] = roomId.split("-");
    if (userId === challengerId) {
      setIsChallenger(true);
      setOpponentId(challengedId);
    } else {
      setIsChallenger(false);
      setOpponentId(challengerId);
    }

    // WebRTC 연결 초기화
    initializeWebRTC(userId);

    // WebRTC 신호 처리
    socket.on("offer", async ({ offer, roomId: receivedRoomId }) => {
      if (peerConnection.current && receivedRoomId === roomId) {
        try {
          console.log(`Offer 수신: ${offer}`);
          const remoteDescription = new RTCSessionDescription(offer);
          await peerConnection.current.setRemoteDescription(remoteDescription);
          console.log("Offer를 Remote Description으로 설정 완료");

          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          console.log("Answer 생성 및 Local Description 설정 완료");

          socket.emit("answer", {
            answer: peerConnection.current.localDescription,
            roomId,
          });
        } catch (error) {
          console.error("Offer 처리 중 오류:", error);
        }
      }
    });

    socket.on("answer", async ({ answer, roomId: receivedRoomId }) => {
      if (peerConnection.current && receivedRoomId === roomId) {
        try {
          console.log(`Answer 수신: ${answer}`);
          const remoteDescription = new RTCSessionDescription(answer);
          await peerConnection.current.setRemoteDescription(remoteDescription);
          console.log("Answer를 Remote Description으로 설정 완료");
        } catch (error) {
          console.error("Answer 처리 중 오류:", error);
        }
      }
    });

    socket.on(
      "ice-candidate",
      async ({ candidate, roomId: receivedRoomId }) => {
        if (peerConnection.current && receivedRoomId === roomId) {
          if (peerConnection.current.remoteDescription) {
            try {
              console.log(`ICE 후보 수신: ${JSON.stringify(candidate)}`);
              await peerConnection.current.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
              console.log("ICE 후보 추가 완료");
            } catch (error) {
              console.error("ICE 후보 추가 중 오류:", error);
            }
          } else {
            console.warn(
              "Remote Description이 설정되지 않아 ICE 후보를 추가할 수 없습니다."
            );
          }
        }
      }
    );

    // 상대방이 준비됐는지
    socket.on("opponentReady", () => {
      setOpponentReady(true);
    });

    // 모두 준비 되면 카운트다운 3초 시작
    socket.on("startCountdown", () => {
      if (countdown === 0) {
        setHideReadyMessage(true); // 메시지 숨기기
        let countdownValue = 3;
        setCountdown(countdownValue);
        const countdownInterval = setInterval(() => {
          countdownValue -= 1;
          setCountdown(countdownValue);
          if (countdownValue === 0) {
            clearInterval(countdownInterval);
            setCanCount(true); // 상태를 명확히 true로 설정
            startGameTimer(); // 게임 시작
          }
        }, 1000);
      }
    });

    // 상대방 점핑잭 카운트 업데이트
    socket.on("updatedCount", ({ userId, count }) => {
      if (userId !== myId) {
        setOpponentCount(count);
      }
    });

    // 상대방이 나갔을 때 처리
    socket.on("userLeft", () => {
      setCanCount(false);
      canCountRef.current = false;
      setOpponentLeft(true); // 상대방 나감 상태 업데이트
      setTimeout(() => {
        navigate(routes.friend); // 이전 페이지로 이동
      }, 5000); // 5초 뒤 페이지 이동
    });

    // 대결 종료시
    socket.on("challengeEnded", ({ message, scores, resultMessage }) => {
      // 최종 스코어와 결과 메시지를 Popup에 표시
      const myScore = scores[userId] === true ? 0 : scores[userId];

      // 나머지 한 명의 점수를 찾기
      const otherUserId = Object.keys(scores).find((key) => key !== userId);
      const otherScore = scores[otherUserId] === true ? 0 : scores[otherUserId];

      setPopupContent(`
  ${message}

  내 점수: ${myScore}점
  
  상대 점수: ${otherScore}점

  ${resultMessage}
      `);
    });

    return () => {
      // 이벤트 정리
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("opponentReady");
      socket.off("startCountdown");
      socket.off("updatedCount");
      socket.off("userLeft");
      socket.off("challengeEnded");

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
    };
  }, [socket, navigate, roomId]);

  const initializeWebRTC = async (userId) => {
    try {
      peerConnection.current = new RTCPeerConnection(iceServers);

      // Local stream
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = localStream.current;

      // Add local stream tracks to peer connection
      localStream.current.getTracks().forEach((track) => {
        console.log(`Adding track: ${track.kind}`);
        peerConnection.current.addTrack(track, localStream.current);
      });

      // Remote stream
      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]; // 상대방 스트림 연결
        }
      };

      // ICE candidate exchange
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, roomId });
        }
      };

      // Create and send offer (if the user is the challenger)
      const challengerId = roomId.split("-")[0];
      if (userId === challengerId) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("offer", { offer, roomId });
      }
    } catch (error) {
      console.error("WebRTC 초기화 오류:", error);
    }
  };

  const handleReady = () => {
    setIsReady(true);
    socket.emit("ready", { roomId });
  };

  // 팝업 닫기
  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  // 점핑잭 카운트 증가 핸들러
  const handleCountIncrease = () => {
    // 카운트 가능한 상태
    console.log("canCount 상태 (ref):", canCountRef.current);
    if (canCountRef.current) {
      setMyCount((prevCount) => {
        console.log("이전 카운트:", prevCount);
        const newCount = prevCount + 1;
        console.log("새로운 카운트:", newCount);
        socket.emit("updateCount", { roomId, count: newCount });
        return newCount;
      });
    } else {
      console.warn("점핑잭 카운트를 증가시킬 수 없는 상태입니다.");
    }
  };

  const startGameTimer = () => {
    const gameDuration = 30; // 게임 시간 30초
    setRemainingTime(gameDuration); // 초기 시간 설정
    setCanCount(true); // 점핑잭 카운트 활성화

    const timerInterval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval); // 타이머 종료
          if (canCountRef.current) {
            setCanCount(false); // 점핑잭 카운트 비활성화
          }
          const token = localStorage.getItem("token");
          if (token) {
            try {
              // 토큰 디코딩
              const decoded = jwtDecode(token);
              const userId = decoded.id; // JWT에서 'id' 키에 해당하는 값 가져오기
              console.log("EndChallenge emit:", { roomId, userId });
              socket.emit("endChallenge", { roomId, userId });
            } catch (error) {
              console.error("JWT 디코딩 오류:", error.message);
            }
          } else {
            console.warn("로컬 스토리지에 토큰이 없습니다.");
          }
          return 0;
        }
        return prevTime - 1; // 1초씩 감소
      });
    }, 1000);
  };

  return (
    <div className="exercise-start-page">
      {isPopupOpen && (
        <Popup
          message="<b><u>준비 버튼</u></b>을 눌러주세요!<br>모두 준비가 완료되면 3초 카운트다운 후 대결이 시작됩니다.<br><span style='background-color:#fff5b1'><b>⛔️ 화면에 머리 끝부터 발 끝까지 보이도록 카메라 위치를 조정해주세요!! </b></span>"
          onClose={() => setIsPopupOpen(false)}
        />
      )}
      {popupContent && (
        <Popup
          message={popupContent}
          onClose={() => {
            setIsPopupOpen(false);
            navigate(-1); // 이전 페이지로 이동
          }}
        />
      )}
      {opponentLeft && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xl font-bold z-30">
          상대방이 방을 나가 대결이 중단되었습니다. 5초 후 이전 화면으로
          돌아갑니다.
        </div>
      )}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => {
            socket.emit("disconnectFromChallenge", { roomId }); // 이벤트 발생
            navigate(routes.friend); // 이전 페이지로 이동
          }}
          className="flex items-center gap-3 px-3 py-1 border-2 border-white hover:bg-white hover:text-black text-white font-bold rounded-lg transform hover:scale-105 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-semibold text-lg">나가기</span>
        </button>
      </div>
      <div className="webcam-container flex h-screen">
        {isChallenger ? (
          <>
            <div></div>
            <div className="local-video w-1/2 h-full flex items-center justify-center bg-gray-200 relative">
              <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-xl font-bold z-10 rounded-lg flex flex-col items-center justify-center">
                <p className="font-sans mb-4 text-3xl bg-black bg-opacity-40 px-3 py-1 rounded">
                  {myId} (나)
                </p>
                <p className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-press-start text-7xl">
                  {myCount}
                </p>
              </div>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isReady && (
                <button
                  onClick={handleReady}
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-5 rounded-3xl text-2xl font-semibold absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hover:scale-105 transition-all duration-200"
                >
                  준비
                </button>
              )}
            </div>
            {/* 프로그레스 바 */}
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{
                  height: `${(remainingTime / 30) * 100}%`, // 시간에 따라 높이 조정
                }}
              />
            </div>
            <div className="remote-video w-1/2 h-full flex items-center justify-center bg-gray-300 relative">
              <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-xl font-bold z-10 rounded-lg flex flex-col items-center justify-center">
                <p className="font-sans mb-4 text-3xl bg-black bg-opacity-40 px-3 py-1 rounded">
                  {opponentId} (상대)
                </p>
                <p className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-press-start text-7xl">
                  {opponentCount}
                </p>
              </div>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white text-3xl font-bold z-20">
                {!hideReadyMessage &&
                  (opponentReady ? "준비 완료" : "준비 중...")}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="remote-video w-1/2 h-full flex items-center justify-center bg-gray-300 relative">
              <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-xl font-bold z-10 rounded-lg flex flex-col items-center justify-center">
                <p className="font-sans mb-4 text-3xl bg-black bg-opacity-40 px-3 py-1 rounded">
                  {opponentId} (상대)
                </p>
                <p className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-press-start text-7xl">
                  {opponentCount}
                </p>
              </div>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white font-bold text-3xl z-20">
                {!hideReadyMessage &&
                  (opponentReady ? "준비 완료" : "준비 중...")}
              </div>
            </div>
            {/* 프로그레스 바 */}
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{
                  height: `${(remainingTime / 30) * 100}%`, // 시간에 따라 높이 조정
                }}
              />
            </div>
            <div className="local-video w-1/2 h-full flex items-center justify-center bg-gray-200 relative">
              <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-xl font-bold z-10 rounded-lg flex flex-col items-center justify-center">
                <p className="font-sans mb-4 text-3xl bg-black bg-opacity-40 px-3 py-1 rounded">
                  {myId} (나)
                </p>
                <p className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-press-start text-7xl">
                  {myCount}
                </p>
              </div>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {!isReady && (
                <button
                  onClick={handleReady}
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-5 rounded-3xl text-2xl font-semibold absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hover:scale-105 transition-all duration-200"
                >
                  준비
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-6xl font-bold z-30">
          {countdown}
        </div>
      )}
      <JumpingJackCounter
        videoRef={localVideoRef}
        onCountIncrease={handleCountIncrease}
      />
      {/* 테스트용 버튼 추가 */}
      {/* <div className="absolute bottom-10 right-10 z-50">
      <button
        onClick={handleCountIncrease}
        className="bg-green-500 hover:bg-green-700 text-white py-2 px-5 rounded-3xl text-2xl font-semibold hover:scale-105 transition-all duration-200"
      >
        카운트 증가 테스트
      </button>
    </div> */}
    </div>
  );
}

export default ChallengeStartPage;
