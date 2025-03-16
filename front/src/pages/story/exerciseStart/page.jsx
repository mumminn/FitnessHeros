import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import Popup from "../../../components/Popup";
import { useNavigate, useLocation } from "react-router-dom";
import JumpingJackCounter from "../../../components/JumpingJackCounter";
import ReturnDisplay from "../../../components/ReturnDisplay";
import { routes } from "../../../constants/routes";
import { saveNewEpisode, addStoryCoin } from "./api";
import ChallengeHandler from "../../../components/ChallengeHandler";

function ExerciseStartPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [count, setCount] = useState(0); // 현재 카운트
  const [currentSet, setCurrentSet] = useState(1); // 현재 세트
  const [isResting, setIsResting] = useState(false); // 휴식 여부
  const [restTime, setRestTime] = useState(20); // 휴식 카운트다운
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false); // 운동 종료 여부

  const restIntervalRef = useRef(null);
  const webcamRef = useRef(null);

  const location = useLocation();
  const { currentEpi } = location.state || {};
  const countPerSet = currentEpi.exe_count;
  const totalSets = currentEpi.exe_set;

  const episode = currentEpi.episode; // 현재 에피소드 숫자 (story db 저장용 변수)
  const exe_name = currentEpi.exe_name; // 현재 운동 이름 (story db 저장용 변수)

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(routes.login);
    }

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (count === countPerSet) {
      // countPerSet에 도달하면 카운트 초기화 및 세트 증가
      setCount(0); // count 초기화
      if (currentSet < totalSets) {
        handleToNextSet(); // 다음 세트로 이동
      } else {
        setIsWorkoutComplete(true); // 운동 종료
      }
    }
  }, [count, countPerSet, currentSet, totalSets]);

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  const handleCountIncrease = () => {
    if (!isResting) {
      setCount((prevCount) => prevCount + 1); // count 증가
    }
  };

  const handleToNextSet = () => {
    // 세트 증가
    setCurrentSet((prevSet) => prevSet + 1);

    // 휴식 로직 시작
    setIsResting(true);
    setRestTime(20);

    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }

    restIntervalRef.current = setInterval(() => {
      setRestTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(restIntervalRef.current);
          setIsResting(false);
          return 20;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleExerciseComplete = async () => {
    const token = localStorage.getItem("token"); // 로컬스토리지에서 토큰 가져오기

    try {
      // 1. 운동 기록 저장
      await saveNewEpisode({
        token,
        episode,
        exe_name,
        exe_count: countPerSet,
        exe_set: totalSets,
      });

      console.log("운동 기록 저장 완료");

      // 2. 코인 추가
      await addStoryCoin(token);
      console.log("코인 추가 완료");

      // 성공 시 페이지 이동
      navigate(routes.episode);
    } catch (error) {
      console.error("운동 저장 또는 코인 추가 중 오류 발생:", error);
      alert("운동 기록 저장 또는 코인 추가에 실패했습니다.");
    }
  };

  return (
    <div className="exercise-start-page bg-black">
      <ChallengeHandler />
      {isPopupOpen ? (
        <Popup
          message="<img alt='점핑잭 튜토리얼' src='/image/jumping_jack.png'/><br><span style='background-color:#fff5b1'><b>⛔️ 화면에 머리 끝부터 발 끝까지 보이도록 카메라 위치를 조정해주세요!! </b></span>"
          onClose={handlePopupClose}
        />
      ) : (
        <div className="webcam-exercise-page flex items-center justify-center h-screen bg-black">
          {!isWorkoutComplete && (
            <>
              <div className="absolute top-0 left-0 w-full z-10">
                <ReturnDisplay />
              </div>
              <div className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-press-start absolute top-5 left-1/2 transform text-7xl -translate-x-1/2 z-10 text-white px-6 py-3 rounded-lg font-bold">
                {`${currentSet}/${totalSets} set`}
              </div>
              <div className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center font-press-start absolute bottom-5 left-1/2 transform text-9xl -translate-x-1/2 z-10 text-white px-6 py-3 rounded-lg font-bold">
                {isResting
                  ? `${restTime}s to next set!`
                  : `${count}/${countPerSet}`}
              </div>
              <JumpingJackCounter
                videoRef={webcamRef}
                onCountIncrease={handleCountIncrease}
              />
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={true}
                className="w-full h-full object-cover"
              />
            </>
          )}
          {isWorkoutComplete && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
              <div className="text-white px-6 py-3 rounded-lg text-2xl font-bold text-center flex flex-col items-center justify-center">
                <div className="flex items-center mb-8">
                  <div className="flex items-center px-3 py-2 bg-white bg-opacity-20 rounded-full font-semibold ml-2 text-2xl">
                    +
                    <img
                      src="/image/friend/coin.png"
                      alt="코인"
                      className="h-7 mr-3 ml-2"
                    />
                    <span className=" text-white">20</span>
                  </div>
                </div>
                <p className="mb-16">
                  운동이 종료되었습니다. 20코인이 적립되었어요!
                </p>

                <button
                  onClick={handleExerciseComplete}
                  className="block mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-xl font-semibold"
                >
                  확인
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExerciseStartPage;
