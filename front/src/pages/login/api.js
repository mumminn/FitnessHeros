import axios from "axios";

export const login = async (id, password) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/login`,
      { id, password }
    );
    // 로그인 성공 시
    if (response.status === 200 && response.data.success) {
      localStorage.setItem("token", response.data.token); // 로그인 성공 시 JWT를 localStorage에 저장
      return {
        success: true,
        token: response.data.token,
        isFirstTime: response.data.isFirstTime,
      };
    }
  } catch (error) {
    // 에러 처리
    if (error.response) {
      const { data } = error.response;
      return { success: false, message: data.message }; // 서버의 메시지를 바로 표시
    }
    // 그 외 에러 처리
    return {
      success: false,
      message: "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
};

// 보호된 경로에 접근할 때 JWT를 Authorization 헤더에 포함
export const getProtectedData = async () => {
  const token = localStorage.getItem("token"); // localStorage에서 토큰 가져오기

  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/protected`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Bearer 방식으로 토큰 전송
        },
      }
    );

    return response.data; // 서버에서 받은 데이터 반환
  } catch (error) {
    console.error("Failed to fetch protected data:", error);
    throw error;
  }
};
