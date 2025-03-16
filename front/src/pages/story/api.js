import axios from "axios";

export const getLatestStoryEpisode = async (token) => {
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

    // 데이터가 배열 형식으로 반환될 때, episode가 가장 큰 객체를 찾기
    const episodes = response.data;
    const maxEpisode = Math.max(...episodes.map((episode) => episode.episode));
    const latestEpisode = episodes.find(
      (episode) => episode.episode === maxEpisode
    );

    return latestEpisode; // 가장 큰 episode 값을 가진 객체를 반환
  } catch (error) {
    console.error("Failed to fetch story episode:", error);
    throw error;
  }
};
