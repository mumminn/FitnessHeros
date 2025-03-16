import axios from "axios";

// 스킨 구매 API 호출
export const buySkin = async (token, skinName) => {
  try {
    const response = await axios.patch(
      `${process.env.REACT_APP_SERVER_URL}/api/character/buy-skin`,
      { skin_name: skinName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // { message, remainingCoin, skins }
  } catch (error) {
    console.error("스킨 구매 실패:", error);
    throw error;
  }
};

// 캐릭터 정보 가져오기 API 호출
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
    return response.data; // { character, coin, currentSkin, skins }
  } catch (error) {
    console.error("캐릭터 정보 가져오기 실패:", error);
    throw error;
  }
};
