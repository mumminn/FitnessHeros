import axios from "axios";

export const saveOnboardingInfo = async (onboardingData) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authorization token is missing"); // 토큰이 없을 때 예외 처리
  }

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/user/onboarding`,
      onboardingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.message;
  } catch (error) {
    console.error("Failed to save onboarding info:", error);
    throw error;
  }
};
