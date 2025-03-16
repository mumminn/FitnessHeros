import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Component1 from "./_components/Component1";
import Component2 from "./_components/Component2";
import Component3 from "./_components/Component3";
import Component4 from "./_components/Component4";
import Component5 from "./_components/Component5";
import Component6 from "./_components/Component6";
import Component7 from "./_components/Component7";
import { routes } from "../../constants/routes";

function OnBoardingPage() {
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState(null);
  const [concern, setConcern] = useState("");
  const [character, setCharacter] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (isComplete) {
      setStep((prevStep) => prevStep + 1);
      setIsComplete(false);
    }
  };

  useEffect(() => {
    if (step === 5) {
      const timer = setTimeout(() => {
        setStep(6);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [step]);



  const components = [
    <Component1 moveToNext={() => setIsComplete(true)} setName={setName} />,
    <Component2
      moveToNext={() => setIsComplete(true)}
      setBirthdate={setBirthdate}
    />,
    <Component3 moveToNext={() => setIsComplete(true)} setGender={setGender} />,
    <Component4
      moveToNext={() => setIsComplete(true)}
      setConcern={setConcern}
    />,
    <Component5
      moveToNext={() => setIsComplete(true)}
      setCharacter={setCharacter}
    />,
    <Component6 name={name} />,
    <Component7
      character={character}
      name={name}
      birthdate={birthdate}
      gender={gender}
      concern={concern}
      moveToMenu={() => navigate("/tutorial")}
    />,
  ];

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
          Onboarding
        </h1>
        <div className="text-left bg-white text-black px-6 sm:px-10 md:px-20 rounded-xl py-16 w-full max-w-md md:max-w-lg lg:max-w-xl">
          {components[step]}
          {step !== 5 && step !== 6 && (
            <div className="text-right">
              <button
                className={`mt-4 text-base font-semibold py-1 ml-auto ${
                  isComplete
                    ? "text-[#0675C5] hover:text-[#143978]"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                onClick={handleNext}
                disabled={!isComplete}
              >
                다음 &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnBoardingPage;
