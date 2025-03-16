import axios from "axios";

export const saveNewEpisode = async ({
  token,
  episode,
  exe_name,
  exe_count,
  exe_set,
}) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/story/save-exercise`,
      { episode, exe_name, exe_set, exe_count },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("운동 기록 저장 성공:", response.data);
    return response.data; // 저장 성공 시 데이터 반환
  } catch (error) {
    console.error("운동기록 저장저장 실패", error);
    throw error;
  }
};

export const addStoryCoin = async (token) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/story/add-coin`,
      {}, // 요청 바디가 필요 없으면 빈 객체
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("코인 추가 성공:", response.data);
    return response.data; // 성공적으로 추가된 데이터 반환
  } catch (error) {
    console.error("코인 추가 실패:", error);
    throw error; // 에러를 상위로 전달
  }
};
