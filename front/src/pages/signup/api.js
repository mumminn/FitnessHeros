import axios from "axios";

export const checkIdAvailability = async (id) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/signup/check-id`,
      { id }
    );
    return response.data.isAvailable;
  } catch (error) {
    throw error.response ? error.response.data : new Error("ID 확인 실패");
  }
};

export const signup = async (id, password, email) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/signup`,
      { id, password, email }
    );
    return response.data;
  } catch (error) {
    throw error.response && error.response.data.message
      ? error.response.data.message
      : new Error("회원가입 실패");
  }
};
