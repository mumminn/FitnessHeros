//스토리 조회
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/user");
const Story = require("../models/story");
const Character = require("../models/character")
const Exercise = require("../models/exercise"); // 경로 확인

const secretKey = "hi"; // 환경 변수 대신 character.js에서 사용하는 동일한 key 사용

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  // Authorization 헤더 확인
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization 토큰이 필요합니다." });
  }

  // 토큰 추출
  const token = authHeader.split(" ")[1];

  // 토큰 검증
  jwt.verify(token, secretKey, (err, user) => {
    // 수정: JWT_SECRET 대신 secretKey 사용
    if (err) {
      return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
    }
    req.user = user;
    next();
  });
};

// post /api/story 엔드포인트
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // 토큰에서 추출한 사용자 ID

    // 데이터베이스에서 사용자 스토리 에피소드 조회
    const storyEpisodes = await Story.find({ id: userId });

    // 스토리 에피소드가 있는지 확인
    if (!storyEpisodes || storyEpisodes.length === 0) {
      return res
        .status(404)
        .json({ error: "스토리 에피소드를 찾을 수 없습니다." });
    }

    // 에피소드 데이터를 JSON 응답으로 전송
    res.json(
      storyEpisodes.map((episode) => ({
        concern: episode.concern,
        episode: episode.episode,
        date: episode.date.toISOString().split("T")[0],
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 내부 오류입니다." });
  }
});

// POST /api/story/save-exercise 엔드포인트
router.post("/save-exercise", authenticateToken, async (req, res) => {
  const { episode, exe_name, exe_set, exe_count } = req.body;

  const userId = req.user.id;

  // 사용자 존재 확인
  const user = await User.findOne({ id: userId });
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }

  try {
    // 새로운 Story 인스턴스 생성
    const newStory = new Story({
      id: userId,
      concern: user.concern,
      episode,
      exe_name,
      exe_set,
      exe_count,
      date: new Date(),
    });

    // MongoDB에 저장
    await newStory.save();

    res.json({ message: "운동 정보가 성공적으로 저장되었습니다." });
  } catch (error) {
    console.error("데이터 저장 오류:", error);
    res.status(500).json({ error: "데이터 저장 실패" });
  }
});

// POST /api/story/add-coin 엔드포인트
router.post("/add-coin", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // 캐릭터 정보 조회
    const character = await Character.findOne({ id: userId });
    if (!character) {
      return res.status(404).json({ error: "캐릭터 정보를 찾을 수 없습니다." });
    }

    // 코인 +20 추가
    character.coin = (character.coin || 0) + 20;
    await character.save();

    res.json({ message: "코인이 성공적으로 추가되었습니다.", coin: character.coin });
  } catch (error) {
    console.error("코인 추가 오류:", error);
    res.status(500).json({ error: "코인 추가 실패" });
  }
});


module.exports = router;
