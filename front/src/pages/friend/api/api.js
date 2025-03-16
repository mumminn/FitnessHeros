import axios from "axios";

// 친구 목록 조회
export const fetchFriendList = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/friend`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("친구 목록 조회 실패:", error);
    throw error.response
      ? error.response.data
      : new Error("친구 목록 조회 실패");
  }
};

// 친구 조회(검색)
export const searchFriend = async (token, friendId) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/friend/search`,
      { id: friendId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("친구 추가 중 오류 발생:", error);
    throw error.response
      ? error.response.data
      : new Error("친구 추가 중 오류 발생");
  }
};

// 친구 초대하는 함수
export const inviteFriend = async (token, friendId) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/friend/invite`,
      { friendId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("초대 중 오류 발생:", error);
    throw error;
  }
};

// 코인 확인 함수
export const checkCoin = async (token, friendId) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/match/check-coin`,
      { friendId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("코인 확인 중 오류 발생:", error);
    throw error.response
      ? error.response.data
      : new Error("코인 확인 중 오류 발생");
  }
};
