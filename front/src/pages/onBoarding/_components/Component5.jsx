import React, { useState, useEffect } from "react";

function Component5({ moveToNext, setCharacter }) {
  const [character, setSelectedCharacter] = useState(""); // 캐릭터 선택 상태 관리

  // 캐릭터가 선택되면 다음 버튼을 활성화시키기 위해 moveToNext 호출
  useEffect(() => {
    if (character) {
      setCharacter(character); // 부모 컴포넌트에 캐릭터 정보 전달
      moveToNext(); // 캐릭터가 선택되면 다음 단계로 이동 가능
    }
  }, [character, moveToNext, setCharacter]);

  return (
    <div className="text-left">
      <h2 className="text-2xl font-bold">
        나와 함께 성장할 캐릭터를 선택하세요
      </h2>
      <p className="text-sm text-green-600 mb-12 font-semibold">
        한 번 선택한 캐릭터는 바꿀 수 없으니 신중하세요!
      </p>

      {/* 3개의 캐릭터 버튼 가로로 정렬 */}
      <div className="flex justify-center space-x-10 font-semibold">
        {/* 옐로 캐릭터 */}
        <button onClick={() => setSelectedCharacter("옐로")} className="w-28">
          <img
            src="/image/character/옐로.png"
            alt="옐로"
            className="w-28 h-44 mx-auto mb-4"
          />
          <p
            className={`text-center px-4 py-2 border-2 rounded-full ${
              character === "옐로"
                ? "bg-[#FF9500] border-[#FF9500] text-white"
                : "border-[#FF9500] text-[#FF9500]"
            }`}
          >
            옐로
          </p>
        </button>

        {/* 블로 캐릭터 */}
        <button onClick={() => setSelectedCharacter("블로")} className="w-28">
          <img
            src="/image/character/블로.png"
            alt="블로"
            className="h-44 mx-auto mb-4"
          />
          <p
            className={`text-center px-4 py-2 border-2 rounded-full ${
              character === "블로"
                ? "bg-[#0675C5] border-[#0675C5] text-white"
                : "border-[#0675C5] text-[#0675C5]"
            }`}
          >
            블로
          </p>
        </button>

        {/* 크로 캐릭터 */}
        <button onClick={() => setSelectedCharacter("크로")} className="w-28">
          <img
            src="/image/character/크로.png"
            alt="크로"
            className="h-44 mx-auto mb-4"
          />
          <p
            className={`text-center px-4 py-2 border-2 rounded-full ${
              character === "크로"
                ? "bg-[#009216] border-[#009216] text-white"
                : "border-[#009216] text-[#009216]"
            }`}
          >
            크로
          </p>
        </button>
      </div>
    </div>
  );
}

export default Component5;
