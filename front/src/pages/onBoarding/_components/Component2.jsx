import React, { useState, useEffect } from "react";

function Component2({ moveToNext, setBirthdate }) {
  const [birthdate, setSelectedBirthdate] = useState(""); // 생년월일 관리

  // 생년월일이 입력되면 다음 버튼을 활성화시키기 위해 moveToNext 호출
  useEffect(() => {
    if (birthdate) {
      setBirthdate(birthdate);
      moveToNext(); // 생년월일이 입력되면 다음 단계로 이동 가능
    }
  }, [birthdate, moveToNext, setBirthdate]);

  return (
    <div>
      <h1 className="text-xl font-semibold block mb-8">
        생년월일 8자리를 입력해주세요.
      </h1>
      <input
        type="date"
        value={birthdate}
        onChange={(e) => setSelectedBirthdate(e.target.value)}
        className="w-full p-2 border-b-2 border-gray-400 focus:border-[#0675C5] focus:outline-none"
      />
    </div>
  );
}

export default Component2;
