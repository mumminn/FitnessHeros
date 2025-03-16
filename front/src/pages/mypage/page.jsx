import React, { useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { routes } from "../../constants/routes";
import Popup from "../../components/Popup";
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";
import { getUserInfo, getStoryInfo } from "./api";
import SocketContext from "../../contexts/SocketContext";
import ChallengeHandler from "../../components/ChallengeHandler";

function MypagePage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInfo, setUserInfo] = useState({});
  const [storyInfo, setStoryInfo] = useState([]);
  const [decodedToken, setDecodedToken] = useState(null);

  const { socket } = useContext(SocketContext); // SocketContext에서 socket을 가져옵니다.
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate(routes.login);
    } else {
      try {
        const decoded = jwtDecode(token);
        setDecodedToken(decoded);
      } catch (error) {
        console.error("토큰 디코딩에 실패했습니다:", error);
        navigate(routes.login);
      }
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getUserInfo(token);
        setUserInfo(data);
      } catch (error) {
        handlePopupOpen("사용자 정보를 불러오는데 실패했습니다.");
      }
    };

    const fetchStoryInfo = async () => {
      try {
        const data = await getStoryInfo(token);
        setStoryInfo(data.slice(1));
      } catch (error) {
        handlePopupOpen("스토리 정보를 불러오는데 실패했습니다.");
      }
    };

    fetchUserInfo();
    fetchStoryInfo();
  }, [token]);

  const handlePopupOpen = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect(); // 소켓 연결 종료
    }
    localStorage.removeItem("token"); // 토큰 삭제
    navigate(routes.main); // 홈 페이지로 이동
  };

  const itemsPerPage = 4;
  const totalPages = Math.ceil(storyInfo.length / itemsPerPage);

  const nextSlide = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentStoryInfo = storyInfo.slice(
    currentIndex * itemsPerPage,
    currentIndex * itemsPerPage + itemsPerPage
  );

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      <ChallengeHandler />
      <ReturnDisplay />
      <CoinInfoDisplay message="마이페이지에선 나에 대한 정보를 알 수 있습니다." />

      {isPopupOpen && (
        <Popup message={popupMessage} onClose={() => setIsPopupOpen(false)} />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1
          className="text-3xl text-white mb-2 font-semibold"
          style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
        >
          마이페이지
        </h1>

        <div className="flex bg-white bg-opacity-20 rounded-xl p-10 text-white w-2/4 justify-center">
          <div className="flex items-center justify-between">
            <div className="font-semibold">
              <div className="flex items-baseline mb-5">
                <span className="text-3xl font-semibold">{userInfo.name}</span>
                <span className="text-lg ml-4 text-gray-300">
                  {userInfo.concern} 히어로즈
                </span>
              </div>
              <p className="mb-2">ID | {decodedToken ? decodedToken.id : ""}</p>
              <p className="mb-2">생년월일 | {userInfo.birthdate}</p>
              <p>성별 | {userInfo.gender ? "남성" : "여성"}</p>
            </div>
          </div>
          <div className="text-center ml-80">
            <div className="flex items-center justify-center mb-4">
              <img
                src={`/image/concern/${userInfo.concern}.png`}
                alt={`${userInfo.concern} 지역`}
                className="h-28"
              />
            </div>
            <p className="text-lg font-semibold">
              진행도 | {storyInfo.length}/33
            </p>
          </div>
        </div>

        {/* "지난 에피소드" 섹션 조건부 렌더링 */}
        {storyInfo.length > 0 && (
          <div className="bg-white bg-opacity-20 rounded-xl p-10 text-white w-2/4 relative">
            <div className="mb-4 flex justify-between">
              <h2 className="text-xl font-semibold text-white">
                지난 에피소드
              </h2>
              <div className="text-right text-sm text-white">
                시작일 | {storyInfo[0] ? storyInfo[0].date : "데이터 없음"}
              </div>
            </div>

            <div className="flex items-center justify-center relative">
              {currentIndex > 0 && (
                <button
                  onClick={prevSlide}
                  className="absolute left-0 text-white text-3xl"
                >
                  &#10094;
                </button>
              )}
              <div className="flex space-x-4 w-full max-w-2xl mx-10 justify-center">
                {currentStoryInfo.map((episode) => (
                  <div
                    key={`${episode.concern}-${episode.episode}`}
                    className="bg-white rounded-lg p-4 w-1/4 text-center text-gray-800"
                  >
                    <h3 className="font-semibold text-lg">
                      {episode.concern} 지역
                    </h3>
                    <p className="font-semibold text-sm mt-2">
                      에피소드 {episode.episode}
                    </p>
                    <p className="font-semibold text-xs mt-2 text-gray-500">
                      {episode.date}
                    </p>
                  </div>
                ))}
              </div>
              {currentIndex < totalPages - 1 && (
                <button
                  onClick={nextSlide}
                  className="absolute right-0 text-white text-3xl"
                >
                  &#10095;
                </button>
              )}
            </div>

            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <span
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentIndex ? "bg-white" : "bg-gray-500"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default MypagePage;
