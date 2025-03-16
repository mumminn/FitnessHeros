import React, { useState, useEffect } from "react";

const EmailVerification = ({ onVerify, setEmail }) => {
  const [emailInput, setEmailInput] = useState("");
  const [serverCode, setServerCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCountdownStarted, setIsCountdownStarted] = useState(false);

  // 이메일 입력 시 부모 컴포넌트의 email 상태를 업데이트
  useEffect(() => {
    setEmail(emailInput);

    // 이메일이 변경될 때마다 초기화
    setServerCode("");
    setVerificationCode("");
    setEmailMsg("");
    setAuthMsg("");
    setLoading(false);
    setIsVerified(false);
    setCountdown(0);
    setIsCountdownStarted(false);
  }, [emailInput, setEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/sendEmail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: emailInput }),
        }
      );

      const data = await response.json();

      if (data.ok) {
        setLoading(false);
        setServerCode(data.code);
        setCountdown(180);
        setIsCountdownStarted(true);
        setEmailMsg("");
      } else {
        setEmailMsg("이메일 발송에 실패했습니다.");
      }
    } catch (error) {
      console.error("오류 발생:", error);
      setEmailMsg("서버와의 연결에 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = () => {
    if (verificationCode === serverCode) {
      setIsVerified(true);
      setAuthMsg("");
      setCountdown(-1);
      onVerify(true);
    } else {
      setAuthMsg("잘못된 인증번호입니다. 다시 시도하세요.");
    }
  };

  useEffect(() => {
    let timer;
    if (countdown > 0 && !isVerified) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (isCountdownStarted && countdown === 0) {
      setEmailMsg("인증 시간이 만료되었습니다.");
      setIsVerified(false);
      setVerificationCode("");
      setIsCountdownStarted(false);
      setCountdown(-1);
    }
    return () => clearInterval(timer);
  }, [countdown, isCountdownStarted, isVerified]);

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit}>
        <div className="flex mb-4">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="이메일 주소"
            required
            className="w-4/6 p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || isVerified || countdown > 0} // 로딩 중이거나 인증 완료 시 비활성화
            className={`w-2/6 ml-2 font-bold py-2 px-4 rounded-full
              ${
                countdown > 0 || isVerified
                  ? "bg-[#0675C5] text-white" // 카운트다운 중일 때 파란색 배경
                  : "bg-white text-black hover:bg-[#0675C5] hover:text-white"
              }`} // 기본 상태
          >
            {loading
              ? "전송 중..."
              : countdown > 0
                ? `남은 시간: ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, "0")}`
                : isVerified
                  ? "인증 완료"
                  : "인증 요청"}
          </button>
        </div>
        <p className="text-red-500">{emailMsg}</p>
      </form>
      {isCountdownStarted && !(countdown === -1) && !isVerified && (
        <div className="flex mb-4">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="인증번호"
            required
            className="w-4/6 p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
          />
          <button
            onClick={handleVerification}
            disabled={isVerified}
            className={`w-2/6 ml-2 bg-white hover:bg-[#0675C5] hover:text-white text-black font-bold py-2 px-4 rounded-full`}
          >
            인증번호 확인
          </button>
        </div>
      )}
      <p className="text-red-500">{authMsg}</p>
    </div>
  );
};

export default EmailVerification;
