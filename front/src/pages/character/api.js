import axios from "axios";

// 캐릭터 정보 조회 API
export const getCharacterInfo = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/character`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("캐릭터 정보 조회 실패:", error);
    throw error.response
      ? error.response.data
      : new Error("캐릭터 정보 조회 실패");
  }
};

// 스킨 변경 API
export const changeCharacterSkin = async (token, skinName) => {
  try {
    const response = await axios.patch(
      `${process.env.REACT_APP_SERVER_URL}/api/character/change-skin`,
      { currentSkin: skinName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("스킨 변경 실패:", error);
    throw error.response ? error.response.data : new Error("스킨 변경 실패");
  }
};
