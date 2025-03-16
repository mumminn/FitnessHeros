import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { routes } from "../../../constants/routes";
import Popup from "../../../components/Popup";
import CoinInfoDisplay from "../../../components/CoinInfoDisplay";
import ReturnDisplay from "../../../components/ReturnDisplay";
import { getEpCardData, getUserGender } from "./api";
import { getLatestStoryEpisode } from "../api";
import ChallengeHandler from "../../../components/ChallengeHandler";

function EpisodePage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [concern, setConcern] = useState("근력");
  const [episodes, setEpisodes] = useState([]);
  const [progressDisplay, setProgressDisplay] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [currentEpi, setCurrentEpi] = useState({});
  const navigate = useNavigate();

  const itemsPerPage = 3; // 페이지당 에피소드 개수

  useEffect(() => {
    const token = localStorage.getItem("token"); // JWT 토큰을 가져오기

    if (!token) {
      navigate(routes.login);
    }

    const fetchData = async () => {
      try {
        const data = await getLatestStoryEpisode(token);
        const userGender = await getUserGender(token);

        setConcern(data.concern);
        setProgressDisplay(`${data.episode} / 33`);

        const exerciseEpisodes = await getEpCardData(data.concern, userGender);

        const episodeCards = exerciseEpisodes.map((exercise) => {
          const isCompleted = exercise.episode <= data.episode;
          const isNext = exercise.episode === data.episode + 1;
          return {
            ...exercise,
            buttonEnabled: isNext,
            isVisible: !isCompleted,
          };
        });
        setEpisodes(episodeCards); // 남아있는 에피소드들 목록
        setCurrentEpi(episodeCards[data.episode]); // episodeCards 중 첫 번째 요소를 currentEpi에 저장
      } catch (error) {
        console.error("Failed to fetch story data:", error);
      }
    };

    fetchData();
  }, [navigate]);

  // 현재 페이지에 표시할 에피소드 계산
  const paginatedEpisodes = episodes
    .filter((epCard) => epCard.isVisible)
    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handleNextPage = () => {
    if (
      (currentPage + 1) * itemsPerPage <
      episodes.filter((epCard) => epCard.isVisible).length
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      <ChallengeHandler />
      <ReturnDisplay />
      <CoinInfoDisplay message="에피소드를 하나씩 수행함으로써 꾸준함을 길러보세요!<br>에피소드를 수행할 때마다 **20코인**이 지급됩니다." />

      {isPopupOpen && (
        <Popup message={popupMessage} onClose={() => setIsPopupOpen(false)} />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1
          className="text-3xl text-white mb-6 font-semibold font-sans"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
          }}
        >
          <span className="text-[#90DEFF]">{concern}</span> 지역
        </h1>

        <div className="flex items-center space-x-6 justify-center w-4/5">
          {/* 고정된 이미지 */}
          <div className="flex flex-col items-center">
            <img
              src={`/image/concern/${concern}.png`}
              alt={`${concern} 운동`}
              className="w-60"
            />
            <div className="mt-4 w-full flex justify-center">
              <div className="bg-white py-2 px-8 rounded-full">
                <p className="text-[#00B2FF] text-xl font-bold">
                  {progressDisplay}
                </p>
              </div>
            </div>
          </div>

          {/* 왼쪽 페이지네이션 버튼 */}
          {currentPage > 0 ? (
            <button
              onClick={handlePrevPage}
              className="text-4xl text-white font-bold"
            >
              &lt;
            </button>
          ) : (
            <div className="w-10" /> // 빈 공간을 만들어 위치 고정
          )}

          {/* 에피소드 카드 리스트 */}
          <div className="flex space-x-6 items-center">
            {paginatedEpisodes.map((epCard, index) => (
              <div
                key={epCard.episode || index}
                className={`rounded-lg px-4 py-8 text-center text-black shadow-md ${
                  epCard.buttonEnabled
                    ? "bg-white"
                    : "bg-gray-300 bg-opacity-50 text-white"
                } w-64`}
              >
                <h3 className="font-semibold text-2xl">
                  에피소드 {epCard.episode}
                </h3>
                <ul className="text-left mt-4 text-base">
                  <li>
                    <p className="font-semibold">{epCard.exe_name}</p> :{" "}
                    {epCard.exe_count}회 X {epCard.exe_set}세트
                  </li>
                </ul>
                {epCard.buttonEnabled ? (
                  <Link
                    to={routes.exercise}
                    state={{ currentEpi }} // nextEpi을 props로 전달
                    className="mt-4 py-2 px-6 rounded-lg font-semibold text-white bg-blue-500 inline-block"
                  >
                    게임 시작
                  </Link>
                ) : (
                  <div className="mt-4 py-2 px-6 rounded-lg font-semibold text-white bg-gray-400 inline-block">
                    잠금
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 오른쪽 페이지네이션 버튼 */}
          {(currentPage + 1) * itemsPerPage <
          episodes.filter((epCard) => epCard.isVisible).length ? (
            <button
              onClick={handleNextPage}
              className="text-4xl text-white font-bold"
            >
              &gt;
            </button>
          ) : (
            <div className="w-10" /> // 빈 공간을 만들어 위치 고정
          )}
        </div>
      </div>
    </div>
  );
}

export default EpisodePage;
