import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../../constants/routes";
import Popup from "../../components/Popup"; // 팝업 컴포넌트 가져오기
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";
import { getLatestStoryEpisode } from "./api"; // API 함수 가져오기
import ChallengeHandler from "../../components/ChallengeHandler";

function StoryPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [concern, setConcern] = useState("근력"); // 예시로 "근력" 설정
  const [episode, setEpisode] = useState(0);
  const navigate = useNavigate();

  const initialConcernList = [
    "근력",
    "근지구력",
    "심폐지구력",
    "기초체력",
    "순발력",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT 토큰을 localStorage에서 가져오기
        if (!token) {
          navigate(routes.login);
        }
        const data = await getLatestStoryEpisode(token);
        setConcern(data.concern);
        setEpisode(data.episode);
      } catch (error) {
        console.error("Failed to fetch story data:", error);
      }
    };

    fetchData();
  }, [navigate]);

  const handlePopupOpen = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  // 선택된 concern을 제외한 나머지 걱정 리스트
  const filteredConcerns = initialConcernList.filter((c) => c !== concern);

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      <ChallengeHandler />
      {/* 뒤로가기 버튼 */}
      <ReturnDisplay />

      {/* 코인 및 정보 팝업 */}
      <CoinInfoDisplay
        message="에피소드를 하나씩 수행함으로써 꾸준함을 길러보세요!<br>
에피소드를 수행할 때마다 **20코인**이 지급됩니다."
      />

      {/* 팝업창 */}
      {isPopupOpen && (
        <Popup
          message={popupMessage}
          onClose={() => setIsPopupOpen(false)} // 닫기 핸들러 전달
        />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1
          className="text-3xl text-white mb-6 font-semibold font-sans"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)", // 흰색 블러 효과
          }}
        >
          <span className="text-[#90DEFF]">{concern} 지역</span>을 책임지고
          구출할 것!!
        </h1>

        {/* 가운데 5개 아이콘 메뉴 */}
        <div className="flex space-x-28 justify-center">
          {/* 왼쪽에 두 개의 concern들 */}
          {filteredConcerns.slice(0, 2).map((c) => (
            <button
              key={c}
              onClick={() => handlePopupOpen("아직 열리지 않은 지역입니다.")}
              className="flex flex-col items-center"
            >
              <p className="text-white text-xl font-semibold mb-2">{c} 지역</p>
              <div className="relative">
                <img
                  src={`/image/concern/${c}.png`}
                  alt={`${c} 지역`}
                  className="w-32"
                  style={{ opacity: 0.4 }}
                />
                <img
                  src="/image/lock_icon.png"
                  alt="아직 열리지 않은 지역"
                  className="w-14 absolute top-4/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
              </div>
            </button>
          ))}

          {/* 선택된 concern */}
          <Link to={routes.episode} className="flex flex-col items-center">
            <img
              src={`/image/concern/${concern}.png`}
              alt={`${concern} 운동`}
              className="w-52"
            />
            <div className="mt-4 w-full flex justify-center">
              <div className="bg-white py-2 px-8 rounded-full">
                <p className="text-[#00B2FF] text-xl font-bold">
                  {episode} / 33
                </p>
              </div>
            </div>
          </Link>

          {/* 오른쪽에 두 개의 concern들 */}
          {filteredConcerns.slice(2, 4).map((c) => (
            <button
              key={c}
              onClick={() => handlePopupOpen("아직 열리지 않은 지역입니다.")}
              className="flex flex-col items-center"
            >
              <p className="text-white text-xl font-semibold mb-2">{c} 지역</p>
              <div className="relative">
                <img
                  src={`/image/concern/${c}.png`}
                  alt={`${c} 지역`}
                  className="w-32"
                  style={{ opacity: 0.4 }}
                />
                <img
                  src="/image/lock_icon.png"
                  alt="아직 열리지 않은 지역"
                  className="w-14 absolute top-4/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StoryPage;
