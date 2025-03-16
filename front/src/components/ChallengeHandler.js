import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { PopupContext } from "../contexts/PopupContext";
import SocketContext from "../contexts/SocketContext";

const ChallengeHandler = () => {
  const { showPopup } = useContext(PopupContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    // challengeReceived 이벤트 처리
    socket.on("challengeReceived", ({ from, roomId }) => {
      showPopup(
        `${from}님이 대결을 신청했습니다. 수락하시겠습니까?`,
        // 수락 동작
        () => {
          console.log("call acceptChallenge");
          socket.emit("joinRoom", { roomId });
          socket.emit("acceptChallenge", { roomId });
          navigate(`/friend/challenge/${roomId}`); // navigate로 이동
        },
        // 거절 동작
        () => {
          console.log("call declineChallenge");
          socket.emit("declineChallenge", { roomId });
        }
      );
    });

    // gameStart 이벤트 처리
    socket.on("gameStart", ({ roomId }) => {
      console.log("Game starting for room:", roomId);
      navigate(`/friend/challenge/${roomId}`); // navigate로 이동
    });

    // Cleanup 이벤트 리스너
    return () => {
      socket.off("challengeReceived");
      socket.off("gameStart");
    };
  }, [socket, showPopup, navigate]);

  return null; // UI가 필요하지 않으므로 null 반환
};

export default ChallengeHandler;
