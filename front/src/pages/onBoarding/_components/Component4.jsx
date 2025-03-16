import React, { useState, useEffect } from "react";

function Component4({ moveToNext, setConcern }) {
  const [concern, setSelectedConcern] = useState(""); // 고민 선택 상태 관리

  // 고민이 선택되면 다음 버튼을 활성화시키기 위해 moveToNext 호출
  useEffect(() => {
    if (concern) {
      setConcern(concern);
      moveToNext(); // 고민이 선택되면 다음 단계로 이동 가능
    }
  }, [concern, moveToNext, setConcern]);

  return (
    <div className="text-left">
      <h2 className="text-xl font-bold">
        {concern ? (
          <>
            <span className="text-[#0675C5]">{concern}</span>을 강화하고
            싶은가요?
          </>
        ) : (
          <>
            가장 큰 <span className="text-[#0675C5]">체력 고민</span>을 한 가지
            선택하세요!
          </>
        )}
      </h2>

      <p className="text-sm text-green-600 mb-8 font-semibold">
        각 고민마다 33개의 에피소드가 준비되어 있어요!
      </p>

      {/* 5개의 고민 버튼 */}
      <div className="space-y-4 text-center text-[#0675C5] font-semibold">
        <button
          onClick={() => setSelectedConcern("근력")}
          className={`w-full px-4 py-2 border-2 rounded-full ${
            concern === "근력"
              ? "bg-[#0675C5] border-[#0675C5] text-white"
              : "border-[#0675C5]"
          }`}
        >
          물건을 들거나 힘을 쓰는 게 힘들어요 😣
        </button>
        <button
          onClick={() => setSelectedConcern("근지구력")}
          className={`w-full px-4 py-2 border-2 rounded-full ${
            concern === "근지구력"
              ? "bg-[#0675C5] border-[#0675C5] text-white"
              : "border-[#0675C5]"
          }`}
        >
          운동을 조금만 해도 쉽게 지쳐요 😩
        </button>
        <button
          onClick={() => setSelectedConcern("심폐지구력")}
          className={`w-full px-4 py-2 border-2 rounded-full ${
            concern === "심폐지구력"
              ? "bg-[#0675C5] border-[#0675C5] text-white"
              : "border-[#0675C5]"
          }`}
        >
          계단을 몇 층만 올라가도 숨이 차요 😥
        </button>
        <button
          onClick={() => setSelectedConcern("기초체력")}
          className={`w-full px-4 py-2 border-2 rounded-full ${
            concern === "기초체력"
              ? "bg-[#0675C5] border-[#0675C5] text-white"
              : "border-[#0675C5]"
          }`}
        >
          일상생활에서 항상 지쳐 있어요 😴
        </button>
        <button
          onClick={() => setSelectedConcern("순발력")}
          className={`w-full px-4 py-2 border-2 rounded-full ${
            concern === "순발력"
              ? "bg-[#0675C5] border-[#0675C5] text-white"
              : "border-[#0675C5]"
          }`}
        >
          빠른 속도로 몸을 움직이기 어려워요 😓
        </button>
      </div>
    </div>
  );
}

export default Component4;
