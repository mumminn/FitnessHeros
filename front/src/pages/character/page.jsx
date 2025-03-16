import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../../constants/routes";
import Popup from "../../components/Popup";
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";
import { getCharacterInfo, changeCharacterSkin } from "./api"; // API 함수 가져오기
import ChallengeHandler from "../../components/ChallengeHandler";

function CharacterPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [character, setCharacter] = useState("크로"); // 기본 캐릭터 이름
  const [currentSkin, setCurrentSkin] = useState("회원복"); // 기본 선택 스킨
  const [skins, setSkins] = useState([]); // 사용자가 소유한 스킨 목록
  const navigate = useNavigate();

  const handlePopupOpen = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  // 캐릭터 정보 불러오기
  useEffect(() => {
    const fetchCharacterInfo = async () => {
      try {
        const token = localStorage.getItem("token"); // 토큰 가져오기
        if (!token) {
          navigate(routes.login);
        }
        const data = await getCharacterInfo(token);
        setCharacter(data.character);
        setCurrentSkin(data.currentSkin);
        setSkins(
          Object.keys(data.skins).filter((skin) => data.skins[skin] === 1)
        ); // 값이 1인 스킨만 가져오기
      } catch (error) {
        handlePopupOpen("캐릭터 정보를 불러오는데 실패했습니다.");
      }
    };

    fetchCharacterInfo();
  }, [navigate]);

  // 스킨 변경 함수
  const handleSkinChange = async (skin) => {
    try {
      const token = localStorage.getItem("token"); // 토큰 가져오기
      await changeCharacterSkin(token, skin);
      setCurrentSkin(skin); // 성공 시 현재 스킨 변경
      handlePopupOpen(`${skin} 스킨으로 변경되었습니다.`);
    } catch (error) {
      handlePopupOpen("스킨 변경에 실패했습니다.");
    }
  };

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
        message="보유하고 있는 스킨을 장착해보세요!<br>
원하는 스킨이 없다면 상점에서 구매할 수 있습니다 :)
"
      />

      {/* 팝업창 */}
      {isPopupOpen && (
        <Popup message={popupMessage} onClose={() => setIsPopupOpen(false)} />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1
          className="text-3xl text-white mb-6 font-semibold"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)", // 흰색 블러 효과
          }}
        >
          캐릭터
        </h1>

        {/* 캐릭터 이미지 */}
        <div className="flex space-x-20 items-center w-full justify-center">
          {/* 왼쪽 캐릭터 */}
          <div className="bg-white bg-opacity-10 rounded-lg p-8">
            <img
              src={`/image/skin/character/${character}_${currentSkin}.png`}
              alt="캐릭터 이미지"
              className="h-80 mx-auto"
            />
          </div>

          {/* 오른쪽 보유 스킨 선택 */}
          <div className="bg-white bg-opacity-10 rounded-lg p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">보유 스킨</h2>
              <Link
                to={routes.store}
                className="flex items-center text-white font-semibold space-x-2 border-2 border-white rounded-xl px-2"
              >
                상점 &gt;
              </Link>
            </div>

            <div className="flex space-x-4">
              {skins.map((skin) => (
                <div
                  key={skin}
                  onClick={() => handleSkinChange(skin)}
                  className={`p-4 rounded-lg cursor-pointer ${
                    currentSkin === skin
                      ? "bg-blue-400"
                      : "bg-white bg-opacity-20"
                  }`}
                >
                  <img
                    src={`/image/skin/skin/${skin}.png`}
                    alt={`${skin} 이미지`}
                    className="h-60"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterPage;
