const express = require("express");
const router = express.Router();
const Exercise = require("../models/exercise"); // Exercise 모델 불러오기

// GET /api/exercise 엔드포인트
router.get("/", async (req, res) => {
  try {
    const { concern, gender } = req.query;


    // 데이터베이스에서 조건에 맞는 모든 운동 정보 조회
    const exerciseInfo = await Exercise.find({ concern, gender });

    if (!exerciseInfo || exerciseInfo.length === 0) {
      return res.status(404).json({ error: "운동 정보를 찾을 수 없습니다." });
    }

    // 운동 정보 데이터를 JSON 응답으로 전송
    res.json(exerciseInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 내부 오류입니다." });
  }
});

module.exports = router;
