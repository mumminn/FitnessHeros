import React, { createContext, useState } from "react";

export const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState(null);
  const [onConfirm, setOnConfirm] = useState(null); // 확인 버튼 콜백
  const [onCancel, setOnCancel] = useState(null); // 거절 버튼 콜백

  const showPopup = (message, confirmCallback, cancelCallback) => {
    setPopup({ message }); // 팝업 메시지 설정
    setOnConfirm(() => confirmCallback); // 확인 콜백 등록
    setOnCancel(() => cancelCallback); // 거절 콜백 등록
  };

  const hidePopup = () => {
    setPopup(null);
    setOnConfirm(null);
    setOnCancel(null);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm(); // 확인 콜백 실행
    hidePopup();
  };

  const handleCancel = () => {
    if (onCancel) onCancel(); // 거절 콜백 실행
    hidePopup();
  };

  return (
    <PopupContext.Provider
      value={{ popup, showPopup, hidePopup, handleConfirm, handleCancel }}
    >
      {children}
    </PopupContext.Provider>
  );
};
