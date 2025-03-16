import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import EmailVerification from "../../components/EmailVerification";

import { routes } from "../../constants/routes";
import { checkIdAvailability, signup } from "./api";

function SignUpPage() {
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [isIdValid, setIsIdValid] = useState(false); // 중복확인 여부
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCheckButtonDisabled, setIsCheckButtonDisabled] = useState(false); // 중복 확인 버튼 비활성화 상태
  const [userIdError, setUserIdError] = useState(""); // 중복 확인 에러 메시지 상태
  const navigate = useNavigate();

  // 페이지 로드 시 토큰이 있으면 자동으로 홈으로 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(routes.menu); // 토큰이 있으면 홈으로 이동
    }
  }, [navigate]);

  // 중복 ID 체크
  const handleCheckId = async () => {
    const isValid = await checkIdAvailability(id);
    setIsIdValid(isValid);
    if (isValid) {
      setUserIdError(""); // 에러 메시지 초기화
      setIsCheckButtonDisabled(true); // 중복 확인 완료 후 버튼 비활성화
    } else {
      setUserIdError("이미 존재하는 아이디입니다."); // 에러 메시지 설정
    }
  };

  // 비밀번호 일치 및 입력 여부 확인
  const handlePasswordBlur = () => {
    const isMatch =
      password1 === password2 && password1 !== "" && password2 !== "";
    setIsPasswordMatch(isMatch);
  };

  // 아이디 변경 시 중복 확인 버튼 활성화
  const handleUserIdChange = (e) => {
    setId(e.target.value);
    setIsCheckButtonDisabled(false); // 아이디 입력 시 버튼 활성화
    setIsIdValid(false); // 새로운 아이디 입력 시 유효성 초기화
    setUserIdError(""); // 에러 메시지 초기화
  };

  // 비밀번호 입력 시 회원가입 버튼 활성화 여부 확인
  const handlePasswordChange = (setter) => (e) => {
    setter(e.target.value);
    const isMatch =
      password1 === password2 && password1 !== "" && password2 !== "";
    setIsPasswordMatch(isMatch);
  };

  // 이메일 인증
  const handleEmailVerification = () => {
    setIsEmailVerified(true); // 이메일 인증 완료 시 상태 변경
  };

  const isFormComplete = () => {
    return (
      isEmailVerified && // 이메일 인증 완료 여부 확인
      isIdValid &&
      id !== "" &&
      password1 !== "" &&
      password2 !== "" &&
      password1 === password2 &&
      email !== ""
    );
  };

  // 회원가입 처리
  const handleSignUp = async () => {
    const isSignedUp = await signup(id, password1, email);
    if (isSignedUp) {
      alert("회원가입 성공!");
      navigate(routes.login); // 회원가입 성공 시 로그인 페이지로 이동
    } else {
      alert("회원가입 실패. 다시 시도해주세요.");
    }
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
        <div className="bg-white bg-opacity-10 px-6 sm:px-10 md:px-20 rounded-xl py-16 max-w-md md:max-w-lg lg:max-w-xl w-full mx-auto">
          <div className="mb-4">
            <div className="flex">
              <input
                id="userId"
                type="text"
                placeholder="아이디"
                className={`w-4/6 p-2 border-b-2 ${
                  userIdError ? "border-red-500" : "border-white"
                } focus:border-[#0675C5] bg-transparent text-white focus:outline-none`}
                value={id}
                onChange={handleUserIdChange} // 아이디 입력 시 상태 변경
              />
              <button
                className={`w-2/6 ml-2 ${
                  isCheckButtonDisabled
                    ? "bg-[#0675C5] text-white"
                    : "bg-white text-black"
                } font-bold py-2 px-4 rounded-full ${
                  isCheckButtonDisabled ? "cursor-not-allowed" : ""
                }`}
                onClick={handleCheckId}
                disabled={isCheckButtonDisabled} // 중복 확인 버튼 비활성화 여부
              >
                {isCheckButtonDisabled ? "사용 가능" : "중복 확인"}
              </button>
            </div>
            {userIdError && (
              <p className="text-red-500 text-sm mt-2 text-left">
                {userIdError}
              </p>
            )}
          </div>
          <div className="mb-4">
            <input
              id="password1"
              type="password"
              placeholder="비밀번호"
              className="w-full p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
              value={password1}
              onChange={handlePasswordChange(setPassword1)} // 비밀번호1 변경
              onBlur={handlePasswordBlur}
            />
          </div>
          <div className="mb-4">
            <input
              id="password2"
              type="password"
              placeholder="비밀번호 확인"
              className={`w-full p-2 border-b-2 ${
                !isPasswordMatch ? "border-red-500" : "border-white"
              } focus:border-[#0675C5] bg-transparent text-white focus:outline-none`}
              value={password2}
              onChange={handlePasswordChange(setPassword2)} // 비밀번호2 변경
              onBlur={handlePasswordBlur}
            />
            {!isPasswordMatch && (
              <p className="text-red-500 text-sm mt-2 text-left">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>
          <EmailVerification
            onVerify={handleEmailVerification}
            setEmail={setEmail}
          />
          <button
            className={`w-full font-bold py-2 px-4 rounded-full ${
              isFormComplete()
                ? "bg-white hover:bg-[#0675C5] text-black hover:text-white"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
            onClick={handleSignUp}
            disabled={!isFormComplete()}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
