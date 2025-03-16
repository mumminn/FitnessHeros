import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../constants/routes";

function ReturnDisplay() {
  const navigate = useNavigate(); // useNavigate 훅 사용

  const goBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  return (
    <div className="absolute top-4 left-4 flex items-center space-x-8">
      {/* 홈으로 가기 */}
      <Link to={routes.menu} className="flex items-center">
        <img src="/image/home_icon.png" alt="icon" className="w-10 h-10" />
      </Link>

      {/* 뒤로가기 */}
      <button onClick={goBack} className="flex items-center">
        <img src="/image/back_icon.png" alt="back" className="w-10 h-10" />
      </button>
    </div>
  );
}

export default ReturnDisplay;
