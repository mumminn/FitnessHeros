import React, { useState } from "react";
import Step1 from "./_components/Step1";
import Step2 from "./_components/Step2";
import Step3 from "./_components/Step3";
import Step4 from "./_components/Step4";
import Step5 from "./_components/Step5";
import { routes } from "../../constants/routes";

export const TutorialPage = () => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prevStep) => prevStep - 1);
    }
  };

  const steps = [<Step1 />, <Step2 />, <Step3 />, <Step4 />, <Step5 />];

  // 새로고침 후 메뉴로 이동하는 함수
  const moveToMenuWithRefresh = () => {
    window.location.replace(routes.menu);
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/image/background.png')",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // 배경색과 투명도 설정
        backgroundBlendMode: "overlay", // 배경색과 이미지 섞기
      }}
    >
      <div className="relative flex items-center justify-center h-full">
        <div className="relative">
          {steps[step]}
          {/* Next 버튼 */}
          {step < steps.length - 1 && (
            <img
              className="absolute w-[46px] h-[53px] right-[-20px] top-1/2 transform -translate-y-1/2 cursor-pointer"
              alt="Next"
              src="/image/tutorial/Next.svg"
              onClick={handleNext}
            />
          )}
          {/* Back 버튼 */}
          {step > 0 && (
            <img
              className="absolute w-[46px] h-[53px] left-[-20px] top-1/2 transform -translate-y-1/2 cursor-pointer"
              alt="Back"
              src="/image/tutorial/Back.svg"
              onClick={handleBack}
            />
          )}
        </div>
      </div>
      {/* 완료 버튼 */}
      {step === steps.length - 1 && (
        <button
          onClick={moveToMenuWithRefresh}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          피트니스 히어로즈 시작하기
        </button>
      )}
    </div>
  );
};

export default TutorialPage;
