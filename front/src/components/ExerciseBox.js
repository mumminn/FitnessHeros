import React from "react";

function ExerciseBox({
  title,
  subtitle,
  description,
  imgSrc,
  exercises,
  onButtonClick,
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-72 h-auto flex flex-col justify-between">
      <div className="mb-8">
        <p className="text-base font-semibold mb-4">{subtitle}</p>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm font-semibold text-green-600">{description}</p>
      </div>
      <button
        onClick={onButtonClick} // 버튼 클릭 시 핸들러 호출
        className="bg-blue-600 text-white rounded-full py-2 mb-8"
      >
        운동하기
      </button>
      <div className="flex items-center justify-center h-32">
        <img src={imgSrc} alt={title} className="h-28" />
      </div>
      {/* 이미지 아래 텍스트 */}
      <ul className="text-left text-base mt-8 space-y-1">
        {exercises.map((exercise, index) => (
          <li key={index}>✔️ {exercise}</li>
        ))}
      </ul>
    </div>
  );
}

export default ExerciseBox;
