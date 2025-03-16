const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Friend = require("../models/friend");
const Character = require("../models/character");
const Challenge = require("../models/challenge");

const secretKey = "hi"; // 인증에 사용할 비밀 키

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization 토큰이 필요합니다." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
    }
    req.user = user; // 사용자 정보 저장
    next();
  });
};

// 코인 확인
router.post("/check-coin", authenticateToken, async (req, res) => {
  const userId = req.user.id; // 토큰에서 추출한 사용자 ID
  const { friendId } = req.body;

  try {
    // 사용자 캐릭터 조회
    let userCharacter = await Character.findOne({ id: userId });
    let friendCharacter = await Character.findOne({ id: friendId });

    // 사용자의 캐릭터가 존재하지 않으면 에러 반환
    if (!userCharacter) {
      return res.status(404).json({
        status: "error",
        message: "해당 사용자를 찾을 수 없습니다.",
      });
    }

    // 친구의 캐릭터가 존재하지 않으면 에러 반환
    if (!friendCharacter) {
      return res.status(404).json({
        status: "error",
        message: "해당 사용자를 찾을 수 없습니다.",
      });
    }

    // 자신의 코인이 3 이상인지 확인
    if (userCharacter.coin < 3) {
      return res.status(200).json({
        status: "fail",
        message: "코인이 부족하여 대결 신청을 할 수 없습니다.",
      });
    } else if (friendCharacter.coin < 3) {
      // 코인이 부족한 경우
      return res.status(200).json({
        status: "fail",
        message: "상대방의 코인이 부족하여 대결 신청을 할 수 없습니다.",
      });
    } else {
      return res.status(200).json({
        status: "success",
        message: "대결을 신청합니다.",
      });
    }
  } catch (error) {
    // 에러 처리
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "코인 처리 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

// 코인 차감
router.post("/reduce-coin", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // 캐릭터 정보 조회
    const character = await Character.findOne({ id: userId });
    if (!character) {
      return res.status(404).json({ error: "캐릭터 정보를 찾을 수 없습니다." });
    }

    // 코인 차감
    character.coin -= 3;
    await character.save();

    res.json({
      message: "코인이 성공적으로 차감되었습니다.",
      coin: character.coin,
    });
  } catch (error) {
    console.error("코인 차감 오류:", error);
    res.status(500).json({ error: "코인 차감 실패" });
  }
});

module.exports = router;
