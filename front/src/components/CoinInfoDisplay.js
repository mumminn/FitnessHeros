import React, { useState, useEffect, useContext } from "react";
import Popup from "./Popup";
import { getCoinCount } from "./api/coinAPI";
import SocketContext from "../contexts/SocketContext";

function CoinInfoDisplay({ message }) {
  const [coinCount, setCoinCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { socket } = useContext(SocketContext);

  const fetchCoinCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const count = await getCoinCount(token); // 서버에서 코인 정보 가져오기
      setCoinCount(count); // 상태 업데이트
    } catch (error) {
      console.error("Failed to fetch coin count:", error);
    }
  };

  useEffect(() => {}, [coinCount]);

  useEffect(() => {
    // 초기 코인 정보 가져오기
    fetchCoinCount();

    // coinUpdated 이벤트 감지
    if (socket) {
      const handleCoinUpdated = () => {
        fetchCoinCount();
      };

      socket.on("coinUpdated", handleCoinUpdated);

      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        socket.off("coinUpdated", handleCoinUpdated);
      };
    }
  }, [socket]); // socket이 변경될 때만 다시 실행

  const handlePopupOpen = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-16">
      <div className="flex items-center">
        <img src="/image/menu/coin_icon.png" alt="Coin" className="w-8 h-8" />
        <p className="text-white text-2xl ml-2">{coinCount}</p>
      </div>

      <div>
        <button onClick={handlePopupOpen}>
          <img src="/image/info_icon.png" alt="Info" className="w-10 h-10" />
        </button>
        {isPopupOpen && <Popup message={message} onClose={handlePopupOpen} />}
      </div>
    </div>
  );
}

export default CoinInfoDisplay;
