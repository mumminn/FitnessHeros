import axios from "axios";

// 사용자 정보 조회 API
export const getUserInfo = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("사용자 정보 조회 실패:", error);
    throw error.response
      ? error.response.data
      : new Error("사용자 정보 조회 실패");
  }
};

// 스토리 정보 조회 API
export const getStoryInfo = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/story`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("스토리 정보 조회 실패:", error);
    throw error.response
      ? error.response.data
      : new Error("스토리 정보 조회 실패");
  }
};
