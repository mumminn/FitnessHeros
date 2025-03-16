import React, { useState, useEffect } from "react";

function Component1({ moveToNext, setName }) {
  // setName을 props로 받아옴
  const [inputName, setInputName] = useState(""); // 로컬 상태로 이름 관리

  // 이름이 입력되면 다음 버튼을 활성화시키기 위해 moveToNext 호출
  useEffect(() => {
    if (inputName.trim()) {
      setName(inputName); // 부모 컴포넌트의 name 상태 업데이트
      moveToNext();
    }
  }, [inputName, moveToNext, setName]);

  return (
    <div>
      <h1 className="text-xl font-semibold block mb-8">
        반가워요! <br /> 어떻게 불러드릴까요?
      </h1>
      <input
        type="text"
        placeholder="이름을 입력하세요"
        value={inputName}
        onChange={(e) => setInputName(e.target.value)} // 로컬 상태 업데이트
        className="w-full p-2 border-b-2 border-gray-400 focus:border-[#0675C5] bg-transparent focus:outline-none"
      />
    </div>
  );
}

export default Component1;
