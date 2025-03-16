import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../constants/routes";
import Popup from "../../components/Popup";
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";
import { buySkin, getCharacterInfo } from "./api";
import SocketContext from "../../contexts/SocketContext";
import ChallengeHandler from "../../components/ChallengeHandler";

function StorePage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [ownedSkins, setOwnedSkins] = useState({}); // 보유한 스킨 초기값
  const [coin, setCoin] = useState(0);
  const token = localStorage.getItem("token"); // 예시로 토큰을 localStorage에서 가져옴
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!token) {
      navigate(routes.login);
    }
  }, [navigate, token]);

  useEffect(() => {
    // 초기 캐릭터 정보 불러오기
    const fetchCharacterInfo = async () => {
      try {
        const data = await getCharacterInfo(token);
        setOwnedSkins(data.skins);
        setCoin(data.coin);
      } catch (error) {
        console.error("캐릭터 정보 불러오기 실패:", error);
      }
    };

    fetchCharacterInfo();
  }, [token, socket]);

  const handlePopupOpen = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  // 스킨 목록과 가격
  const skins = [
    {
      id: "헬린이",
      name: "헬린이 스킨",
      price: 0,
      image: "/image/skin/skin/헬린이.png",
    },
    {
      id: "초급자",
      name: "초급자 스킨",
      price: 30,
      image: "/image/skin/skin/초급자.png",
    },
    {
      id: "중급자",
      name: "중급자 스킨",
      price: 60,
      image: "/image/skin/skin/중급자.png",
    },
    {
      id: "고인물",
      name: "고인물 스킨",
      price: 100,
      image: "/image/skin/skin/고인물.png",
    },
  ];

  const handlePurchase = async (skinId, skinPrice) => {
    if (coin >= skinPrice) {
      try {
        const data = await buySkin(token, skinId);
        setOwnedSkins(data.skins);
        setCoin(data.remainingCoin);
        handlePopupOpen(`${skinId} 스킨을 구매했습니다!`);
        socket.emit("coinUpdated");
      } catch (error) {
        handlePopupOpen("스킨 구매에 실패했습니다.");
      }
    } else {
      handlePopupOpen("코인이 부족합니다.");
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      <ChallengeHandler />
      <ReturnDisplay />
      <CoinInfoDisplay message="원하는 스킨을 구매하세요!" />

      {isPopupOpen && (
        <Popup message={popupMessage} onClose={() => setIsPopupOpen(false)} />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1
          className="text-3xl text-white mb-6 font-semibold"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
          }}
        >
          상점
        </h1>

        <div className="flex space-x-8">
          {skins.map((skin) => (
            <div
              key={skin.id}
              className="bg-blue-500 bg-opacity-20 p-6 rounded-lg text-center text-white w-48"
            >
              <h2 className="text-lg font-semibold mb-4">{skin.name}</h2>
              <img
                src={skin.image}
                alt={skin.name}
                className="h-40 mx-auto mb-4"
              />
              <div className="flex items-center justify-center mb-4">
                <img
                  src="/image/menu/coin_icon.png"
                  alt="코인 아이콘"
                  className="h-6 w-6 mr-2"
                />
                <span className="text-yellow-400 text-xl font-bold">
                  {skin.price}
                </span>
              </div>
              {ownedSkins[skin.id] ? (
                <p className="text-green-300 font-semibold">보유 중</p>
              ) : (
                <button
                  onClick={() => handlePurchase(skin.id, skin.price)}
                  className="bg-blue-400 text-white px-4 py-2 rounded-full"
                >
                  구매
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StorePage;
