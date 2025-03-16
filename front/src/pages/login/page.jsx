import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "./api";
import { routes } from "../../constants/routes";
import Popup from "../../components/Popup"; // Popup 컴포넌트 추가

function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState(""); // 팝업 메시지 상태 추가
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업 열림 상태 추가
  const navigate = useNavigate();

  // 페이지 로드 시 토큰이 있으면 자동으로 메뉴로 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(routes.menu); // 토큰이 있으면 메뉴로 이동
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const response = await login(id, password);
      console.log("로그인 응답:", response);

      if (response?.success) {
        console.log("로그인 성공");
        localStorage.setItem("token", response.token);

        if (response.isFirstTime) {
          navigate(routes.onboarding);
        } else {
          handleLoginSuccess(response.token);
          navigate(routes.menu);
        }
      } else {
        console.log("로그인 실패 - 응답:", response);
        setPopupMessage(response.message || "로그인 실패: 다시 시도해주세요.");
        setIsPopupOpen(true);
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      setPopupMessage("로그인 실패: 다시 시도해주세요.");
      setIsPopupOpen(true);
    }
  };

  const handleLoginSuccess = (token) => {
    // 토큰을 로컬 스토리지에 저장
    localStorage.setItem("token", token);

    // 앱 전체를 다시 렌더링
    window.location.reload(); // 페이지 새로고침
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1
          className="text-7xl mb-8 font-press-start"
          style={{
            background: "linear-gradient(90deg, #0675C5 0%, #D9CC59 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Welcome!
        </h1>
        <div className="bg-white bg-opacity-10 px-6 sm:px-10 md:px-20 rounded-xl py-16 w-full max-w-md md:max-w-lg lg:max-w-xl">
          <div className="mb-4">
            <input
              id="id"
              type="text"
              placeholder="아이디"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
            />
          </div>
          <div className="mb-12">
            <input
              id="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-white hover:bg-[#0675C5] text-black hover:text-white font-bold py-2 px-4 rounded-full"
          >
            로그인
          </button>
          <div className="mt-4 flex text-white text-base justify-center">
            <Link
              to="/signup"
              className="hover:text-[#0675C5] hover:font-semibold block text-center"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>

      {/* Popup 컴포넌트 추가 */}
      {isPopupOpen && (
        <Popup message={popupMessage} onClose={() => setIsPopupOpen(false)} />
      )}
    </div>
  );
}

export default LoginPage;
