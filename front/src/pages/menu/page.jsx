import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../../constants/routes";
import CoinInfoDisplay from "../../components/CoinInfoDisplay"; // InfoPopup 컴포넌트 불러오기
import SocketContext from "../../contexts/SocketContext";
import ChallengeHandler from "../../components/ChallengeHandler";

function MenuPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();
  const { socket, isConnected, isInitialized } = useContext(SocketContext); // 초기화 상태 가져오기

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(routes.login);
    }
  }, [navigate]);

  // 소켓 연결 관리
  useEffect(() => {
    if (isInitialized && socket && !isConnected) {
      socket.connect(); // 소켓 초기화가 완료된 후 연결
    }
  }, [socket, isConnected, isInitialized]);

  if (!isInitialized) {
    // 초기화 완료 전 로딩 화면 표시
    return (
      <div
        className="relative w-full h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/image/background.png')" }}
      >
        <div className="font-sans flex items-center justify-center h-screen z-10">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  const handlePopupOpen = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      <ChallengeHandler />
      {/* 코인 및 정보 팝업 */}
      <CoinInfoDisplay
        message="  
      **스토리**<br>
      “에피소드를 하나씩 클리어하며 운동하세요! 성공할 때마다 20코인이 지급됩니다. 목표를 향해 도전해보세요.”  
      <hr>  
      <br>
      **집중 운동**
      “특정 부위를 집중적으로 운동해보세요! (현재 준비 중인 기능입니다. 곧 만나보실 수 있습니다.)”  
      <hr>  
      <br>
      **운동 대결**
      “친구와 함께 운동하며 코인을 걸고 대결하세요! 최고의 운동 챔피언에 도전해보세요.”  
      <hr>  
      <br>
      **캐릭터**  
      “내 캐릭터를 꾸며보세요! 새로운 스킨을 구매하고 스타일을 변경해 나만의 캐릭터를 만들어보세요.”  
      <hr>  
      <br>
      **마이페이지**  
      “나의 활동을 확인하고, 계정을 관리하세요. 로그아웃도 여기서 할 수 있습니다.”  
      "
      />

      {/* 가운데 5개 아이콘 메뉴 */}
      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1
          className="text-3xl text-white mb-6 font-semibold font-sans"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)", // 흰색 블러 효과
          }}
        >
          피트니스 히어로, 에너지를 모아라!
        </h1>
        <div className="flex space-x-20 text-xl font-medium">
          <Link to={routes.story} className="flex flex-col items-center">
            <img
              src="/image/menu/story_icon.png"
              alt="Story"
              className="w-28 h-28"
            />
            <p className="text-white mt-3">스토리</p>
          </Link>
          <Link to={routes.focus} className="flex flex-col items-center">
            <img
              src="/image/menu/focus_icon.png"
              alt="Focus"
              className="w-28 h-28"
            />
            <p className="text-white mt-3">집중 운동</p>
          </Link>
          <Link to={routes.friend} className="flex flex-col items-center">
            <img
              src="/image/menu/together_icon.png"
              alt="Group"
              className="w-28 h-28"
            />
            <p className="text-white mt-3">운동 대결</p>
          </Link>
          <Link to={routes.character} className="flex flex-col items-center">
            <img
              src="/image/menu/character_icon.png"
              alt="Character"
              className="w-28 h-28"
            />
            <p className="text-white mt-3">캐릭터</p>
          </Link>
          <Link to={routes.mypage} className="flex flex-col items-center">
            <img
              src="/image/menu/mypage_icon.png"
              alt="Mypage"
              className="w-28 h-28"
            />
            <p className="text-white mt-3">마이페이지</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
