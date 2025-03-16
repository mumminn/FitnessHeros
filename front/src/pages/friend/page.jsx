import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 임포트
import {
  fetchFriendList,
  searchFriend,
  inviteFriend,
  checkCoin,
} from "./api/api";
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";
import Popup from "../../components/Popup";
import SocketContext from "../../contexts/SocketContext";
import { routes } from "../../constants/routes";
import ChallengeHandler from "../../components/ChallengeHandler";

function FriendPage() {
  const [friendList, setFriendList] = useState([]);
  const [isInvitationSent, setIsInvitationSent] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [newFriendId, setNewFriendId] = useState("");
  const [isChallengePopupOpen, setIsChallengePopupOpen] = useState(false);

  const token = localStorage.getItem("token");
  const { socket, onlineFriends } = useContext(SocketContext);
  const navigate = useNavigate(); // useNavigate 훅 사용

  useEffect(() => {
    if (!token) {
      navigate(routes.login);
      return;
    }
    loadFriends(); // 친구 목록 로드
  }, [token, navigate]);

  useEffect(() => {
    if (socket) {
      setupSocketListeners(); // 소켓 이벤트 리스너 설정
    }

    return () => {
      cleanupSocketListeners(); // 소켓 이벤트 리스너 정리
    };
  }, [socket]);

  useEffect(() => {
    setFriendList((prevList) =>
      prevList.map((friend) => ({
        ...friend,
        isOnline: !!onlineFriends[friend.id],
      }))
    );
  }, [onlineFriends]);

  // 소켓 이벤트 리스너 설정
  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on("error", ({ message }) => {
      setPopupMessage(message);
      setIsPopupOpen(true);
      setIsInvitationSent(false);
    });

    socket.on("challengeDeclined", handleChallengeDeclined);
    socket.on("challengeCancelled", handleChallengeCancelled);

    // 친구 온라인 상태 업데이트 이벤트
    socket.on("friendOnline", ({ friendId }) => {
      onlineFriends[friendId] = true; // 친구 상태를 업데이트
      setFriendList((prevList) =>
        prevList.map((friend) =>
          friend.id === friendId ? { ...friend, isOnline: true } : friend
        )
      );
    });

    // 친구 오프라인 상태 업데이트 이벤트
    socket.on("friendOffline", ({ friendId }) => {
      onlineFriends[friendId] = false; // 친구 상태를 업데이트
      setFriendList((prevList) =>
        prevList.map((friend) =>
          friend.id === friendId ? { ...friend, isOnline: false } : friend
        )
      );
    });

    socket.on("friendStatusUpdate", ({ friendId, isInChallenge }) => {
      setFriendList((prevList) =>
        prevList.map((friend) =>
          friend.id === friendId ? { ...friend, isInChallenge } : friend
        )
      );
    });
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;

    socket.off("error");
    socket.off("challengeReceived");
    socket.off("challengeDeclined");
    socket.off("challengeCancelled");
    socket.off("gameStart");
    socket.on("friendOnline");
    socket.on("friendOffline");
    socket.on("friendStatusUpdate");
  };

  // 친구 목록 로드
  const loadFriends = async () => {
    try {
      const friends = await fetchFriendList(token);
      setFriendList(
        friends.friends.map((friend) => ({
          ...friend,
          isOnline: !!onlineFriends[friend.id],
        }))
      );
    } catch (error) {
      setPopupMessage("친구 목록을 불러오는데 실패했습니다.");
      setIsPopupOpen(true);
    }
  };

  // 대결 신청하기 (초대하는 사람)
  const handleInvite = async (friend) => {
    if (!onlineFriends[friend.id]) {
      setPopupMessage("친구가 온라인 상태일 때만 신청할 수 있습니다.");
      setIsPopupOpen(true);
      return;
    }

    if (isInvitationSent) {
      setPopupMessage(
        "이미 대결 신청을 보냈습니다.<br>30초 뒤에 다시 신청 할 수 있습니다."
      );
      setIsPopupOpen(true);
      return;
    }

    try {
      const coinResponse = await checkCoin(token, friend.id);
      if (coinResponse.status === "fail") {
        setPopupMessage(coinResponse.message);
        setIsPopupOpen(true);
        return;
      }

      const response = await inviteFriend(token, friend.id);
      if (response.success) {
        setIsInvitationSent(true);

        // 친구 초대 상태 업데이트
        setFriendList((prevList) =>
          prevList.map((f) =>
            f.id === friend.id ? { ...f, isInvited: true } : f
          )
        );

        socket.emit("sendChallenge", { friendId: friend.id });

        // 30초 후 초대 상태 초기화
        setTimeout(() => {
          setFriendList((prevList) =>
            prevList.map((f) =>
              f.id === friend.id ? { ...f, isInvited: false } : f
            )
          );
          setIsInvitationSent(false);
        }, 30000);
      } else {
        setPopupMessage(response.message);
        setIsPopupOpen(true);
      }
    } catch (error) {
      console.error("대결 신청 실패:", error);
      if (error.response?.data?.error) {
        setPopupMessage(error.response.data.error);
      } else {
        setPopupMessage("대결 신청 처리 중 오류가 발생했습니다.");
      }
      setIsPopupOpen(true);
    }
  };

  // 대결 취소 처리
  const handleChallengeCancelled = ({ message }) => {
    // 현재 팝업 닫기
    setIsPopupOpen(false);
    setIsChallengePopupOpen(false);

    // 새로운 팝업 메시지 설정
    setTimeout(() => {
      setPopupMessage(message);
      setIsPopupOpen(true);
      setIsInvitationSent(false);
    }, 300); // 팝업 전환을 위한 약간의 지연 시간
  };

  // 대결 거절 처리됨 (초대하는 사람 브라우저에 뜨는거)
  const handleChallengeDeclined = ({ message }) => {
    setPopupMessage(message || "상대방이 대결을 거절했습니다.");
    setIsPopupOpen(true);
    setIsInvitationSent(false);

    setFriendList((prevFriendList) =>
      prevFriendList.map((friend) =>
        friend.isInvited ? { ...friend, isInvited: false } : friend
      )
    );
  };

  // 친구 추가 처리
  const handleAddFriend = async () => {
    if (!newFriendId.trim()) {
      setPopupMessage("팔로우 할 친구의 ID를 입력해주세요.");
      setIsPopupOpen(true);
      return;
    }

    try {
      const response = await searchFriend(token, newFriendId);
      setPopupMessage(`${newFriendId}님을 팔로우합니다!`);
      setIsPopupOpen(true);
      setNewFriendId("");
      loadFriends();
    } catch (error) {
      setPopupMessage(error.message || "친구 추가 중 오류가 발생했습니다.");
      setIsPopupOpen(true);
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      <ChallengeHandler />
      <ReturnDisplay />
      <CoinInfoDisplay message="친구와 코인을 걸고 운동 대결을 펼쳐보세요!" />

      {isPopupOpen && (
        <Popup message={popupMessage} onClose={() => setIsPopupOpen(false)} />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-5 font-sans">
        <h1
          className="text-3xl text-white mb-6 font-semibold"
          style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
        >
          팔로우 중인 친구와 운동 대결을 해보세요!
        </h1>

        <div className="flex items-center">
          <img
            src="/image/friend/competition.png"
            alt="경쟁 아이콘"
            className="h-20"
          />
          <span className="ml-4 text-white font-semibold text-2xl">
            게임 참가비:
          </span>
          <div className="flex items-center px-3 py-1 bg-white bg-opacity-20 rounded-full font-semibold text-lg ml-2">
            <img src="/image/friend/coin.png" alt="코인" className="h-7 mr-3" />
            <span className="text-xl text-white">3</span>
          </div>
        </div>

        {/* 친구 목록 */}
        <div className="w-full max-w-md bg-white bg-opacity-10 rounded-lg p-3">
          <h2 className="text-xl text-white font-semibold mb-2 w-full text-center bg-[#193E59] py-2 rounded-xl">
            팔로우 목록
          </h2>
          <ul className="space-y-0 max-h-72 overflow-y-auto pr-3">
            {friendList.map((friend) => (
              <li
                key={friend.id}
                className="flex justify-between items-center text-white py-2 border-b border-gray-500 last:border-none"
              >
                <span className="flex items-center">
                  <span className="font-semibold mr-1">{friend.name}</span>(
                  {friend.id})
                  <span className="text-sm text-gray-400">
                    - {friend.win}승 {friend.draw}무 {friend.lose}패
                  </span>
                </span>
                <button
                  disabled={
                    !friend.isOnline ||
                    friend.isInvited ||
                    friend.isInChallenge === true
                  }
                  onClick={() => handleInvite(friend)}
                  className={`px-4 py-1 rounded-full font-semibold ${
                    friend.isInChallenge
                      ? "bg-gray-500" // 이미 대결 중인 경우
                      : friend.isInvited
                      ? "bg-[#175874]" // 초대 중일 때 버튼 색상
                      : friend.isOnline
                      ? "bg-[#00B2FF]"
                      : "bg-gray-400"
                  } text-white`}
                >
                  {friend.isInChallenge
                    ? "대결 중" // 이미 대결 중인 경우
                    : friend.isInvited
                    ? "대결 신청 중..." // 초대 상태 표시
                    : friend.isOnline
                    ? "대결신청"
                    : "오프라인"}
                </button>
              </li>
            ))}
          </ul>

          {/* 친구 추가 입력 및 버튼 */}
          <div className="flex items-center mt-4 bg-gray-200 rounded-xl">
            <input
              type="text"
              placeholder="친구의 ID를 입력해주세요"
              value={newFriendId}
              onChange={(e) => setNewFriendId(e.target.value)}
              className="flex-grow py-2 px-3 rounded-xl rounded-r-none bg-gray-200 text-gray-800"
            />
            <button
              onClick={handleAddFriend}
              className="px-4 py-2 rounded-xl bg-[#193E59] text-white font-semibold"
            >
              팔로우 추가 +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FriendPage;
