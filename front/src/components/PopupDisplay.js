import React, { useContext } from "react";
import { PopupContext } from "../contexts/PopupContext";
import YesNoPopup from "./YesNoPopup"; // Yes/No 버튼 팝업 컴포넌트

const PopupDisplay = () => {
  const { popup, handleConfirm, handleCancel } = useContext(PopupContext);

  if (!popup) return null;

  return (
    <YesNoPopup
      message={popup.message}
      onConfirm={handleConfirm} // 확인 버튼 클릭 시 호출
      onCancel={handleCancel} // 거절 버튼 클릭 시 호출
    />
  );
};

export default PopupDisplay;