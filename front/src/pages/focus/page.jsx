import React, { useState } from "react";
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";
import Popup from "../../components/Popup";
import ExerciseBox from "../../components/ExerciseBox"; // 분리된 컴포넌트 가져오기
import ChallengeHandler from "../../components/ChallengeHandler";

function FocusPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // 팝업 열기 함수
  const handlePopupOpen = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
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
      <CoinInfoDisplay message="특정 부위를 집중적으로 운동해보세요!<br><u>(현재 준비 중인 기능입니다. 곧 만나보실 수 있습니다.)</u>" />

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
          집중 운동
        </h1>

        {/* 부위별 박스 4개 */}
        <div className="flex space-x-8">
          <ExerciseBox
            title="가슴"
            subtitle="자세 좋아지기"
            description="웅크린 자세에서 탈출하세요!"
            imgSrc="/image/focus/chest.png"
            exercises={[
              "푸쉬업 15회 X 5세트",
              "다이아몬드 푸쉬업 15회 X 3세트",
              "디클라인 푸쉬업 10회 X 3세트",
            ]}
            onButtonClick={() => handlePopupOpen("아직 오픈 준비중입니다.")} // 버튼 클릭 시 팝업 열기
          />

          <ExerciseBox
            title="엉덩이"
            subtitle="허리 통증 예방하기"
            description="허리 통증을 예방하세요!"
            imgSrc="/image/focus/hip.png"
            exercises={[
              "스쿼트 50회 X 3세트",
              "힙 브릿지 15회 X 3세트",
              "힙 익스텐션 크로스 15회 X 3세트",
            ]}
            onButtonClick={() => handlePopupOpen("아직 오픈 준비중입니다.")} // 버튼 클릭 시 팝업 열기
          />

          <ExerciseBox
            title="코어"
            subtitle="신체 안정성 만들기"
            description="신체 균형을 강화하세요!"
            imgSrc="/image/focus/core.png"
            exercises={[
              "플랭크 60초 X 3세트",
              "버드 독 15회 X 3세트",
              "슈퍼맨 15회 X 3세트",
            ]}
            onButtonClick={() => handlePopupOpen("아직 오픈 준비중입니다.")} // 버튼 클릭 시 팝업 열기
          />

          <ExerciseBox
            title="허벅지"
            subtitle="밸런스 강화하기"
            description="무릎 관절을 보호하세요!"
            imgSrc="/image/focus/thigh.png"
            exercises={[
              "제자리 런지 15회 X 3세트",
              "레그컬 15회 X 3세트",
              "와이드 스쿼트 50회 X 3세트",
            ]}
            onButtonClick={() => handlePopupOpen("아직 오픈 준비중입니다.")} // 버튼 클릭 시 팝업 열기
          />
        </div>
      </div>
    </div>
  );
}

export default FocusPage;
