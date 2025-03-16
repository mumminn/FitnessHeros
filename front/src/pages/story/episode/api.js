import axios from "axios";

export const getStoryEpisode = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/story`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // 사용자가 수행한 에피소드 정보 목록 [{ concern: string, episode: number, date: string }]
  } catch (error) {
    console.error("Failed to fetch story episode:", error);
    throw error;
  }
};

export const getEpCardData = async (concern, gender) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/exercise`,
      {
        params: {
          concern,
          gender,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // 운동 에피소드 정보 목록 [{ exe_name: string, episode: number, exe_set: number, exe_count: number }]
  } catch (error) {
    console.error("Failed to fetch exercise episode:", error);
    throw error;
  }
};
export const getUserGender = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.gender; // 사용자 성별 { gender: string }
  } catch (error) {
    console.error("Failed to fetch user gender:", error);
    throw error;
  }
};
