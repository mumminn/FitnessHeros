import axios from "axios";

export const getCoinCount = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/user/coin`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.coin;
  } catch (error) {
    console.error("Failed to fetch coin count:", error);
    throw error;
  }
};
