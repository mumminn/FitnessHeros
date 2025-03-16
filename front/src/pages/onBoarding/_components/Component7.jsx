import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { saveOnboardingInfo } from "../api"; // api 함수 불러오기

function Component7({
  character,
  moveToMenu,
  name,
  birthdate,
  gender,
  concern,
}) {
  const [flipped, setFlipped] = useState(false); // 이미지 좌우반전 상태 관리

  // 색종이 효과를 실행하는 함수
  const fireConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // 이미지 좌우반전 애니메이션 설정
  useEffect(() => {
    const interval = setInterval(() => {
      setFlipped((prevFlipped) => !prevFlipped); // 좌우반전 상태를 토글
    }, 500); // 0.5초 간격

    return () => clearInterval(interval); // 컴포넌트가 언마운트될 때 타이머 클리어
  }, []);

  // 색종이 효과는 컴포넌트 마운트 시 한 번 실행
  useEffect(() => {
    fireConfetti();
  }, []);

  const handleStart = async () => {
    try {
      await saveOnboardingInfo({ name, birthdate, gender, concern, character });
      moveToMenu();
    } catch (error) {
      console.error("Failed to save onboarding info:", error);
      alert("온보딩 정보 저장에 실패했습니다.");
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-12">
        피트니스 히어로가 되신 걸 환영합니다!
      </h1>

      {/* 선택한 캐릭터 이미지 표시 */}
      <img
        src={`/image/character/${character}.png`}
        alt={character}
        className={`mx-auto w-32 mb-8 transition-transform duration-700 ${
          flipped ? "transform -scale-x-100" : ""
        }`} // 좌우반전 애니메이션 추가
      />

      {/* '시작하기' 버튼 */}
      <button
        onClick={handleStart}
        className="text-lg font-semibold px-6 py-1 bg-white border-2 border-[#0675C5] text-[#0675C5] rounded-full hover:bg-[#0675C5] hover:text-white"
      >
        튜토리얼 보러가기 &gt;
      </button>
    </div>
  );
}

export default Component7;
