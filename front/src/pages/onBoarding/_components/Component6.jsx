import React, { useEffect, useState } from "react";

function Component6({ name }) {
  const [progress, setProgress] = useState(0); // 진행 상태 관리

  // 3초 동안 게이지가 차오르게 설정
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => Math.min(prevProgress + 1, 100)); // 100%가 되면 멈춤
    }, 30); // 30ms마다 1%씩 증가 (총 3초)

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 타이머 클리어
  }, []);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-8 text-black">
        {name}님에게 맞는 에피소드를 구성 중이에요...
      </h1>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-[#0675C5] h-4 rounded-full"
          style={{ width: `${progress}%` }} // 게이지 너비를 진행 상태에 맞게 설정
        ></div>
      </div>
      <p className="mt-2 text-sm text-gray-500">{progress}%</p>
    </div>
  );
}

export default Component6;
