import React from "react";
import ReactMarkdown from "react-markdown"; // react-markdown import
import rehypeRaw from "rehype-raw"; // rehype-raw import

function YesNoPopup({ message, onConfirm, onCancel }) {
  return (
    <>
      {/* 어두운 배경 */}
      <div className="fixed inset-0 bg-black bg-opacity-70 z-10"></div>

      {/* 팝업창 */}
      <div className="text-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-lg z-20 flex flex-col justify-between h-fit">
        {/* Markdown 문법을 적용한 메시지 내용 */}
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message}</ReactMarkdown>

        {/* 확인 및 취소 버튼 */}
        <div className="flex justify-end mt-8 space-x-4">
          <button
            className="bg-gray-500 text-white py-2 px-6 rounded-full shadow-md"
            onClick={onCancel} // 취소 클릭 시
          >
            취소
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-6 rounded-full shadow-md"
            onClick={onConfirm} // 확인 클릭 시
          >
            확인
          </button>
        </div>
      </div>
    </>
  );
}

export default YesNoPopup;
