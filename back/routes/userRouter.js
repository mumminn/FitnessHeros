const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Character = require("../models/character");
const Story = require("../models/story");
const Friend = require("../models/friend");

const secretKey = "hi";

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
    req.user = user; // 사용자 정보를 req.user에 저장
    next();
  });
};

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // 토큰에서 추출한 사용자 ID

    // 데이터베이스에서 사용자 정보 조회
    const user = await User.findOne({ id: userId });

    // 사용자가 존재하지 않는 경우
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 사용자 정보를 JSON 응답으로 전송
    res.json({
      name: user.name || "",
      birthdate: user.birthdate
        ? user.birthdate.toISOString().split("T")[0]
        : "",
      gender: user.gender,
      concern: user.concern || "",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 내부 오류입니다." });
  }
});

// 온보딩 정보 저장
router.post("/onboarding", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // 토큰에서 추출한 사용자 ID

    const { name, birthdate, gender, concern, character } = req.body;
    const validBirthdate =
      birthdate && !isNaN(new Date(birthdate)) ? new Date(birthdate) : null;

    if (!concern || !concern.trim()) {
      return res.status(400).json({ error: "Concern 필드는 필수입니다." });
    }

    const updateData = {
      name: name,
      birthdate: validBirthdate,
      gender: gender,
      concern: concern,
      character: character,
    };

    await User.findOneAndUpdate(
      { id: userId },
      { $set: updateData },
      { new: true }
    );

    const newCharacter = new Character({
      id: userId,
      character,
      coin: 10,
      skin: {
        헬린이: 1,
        초급자: 0,
        중급자: 0,
        고인물: 0,
      },
      currentSkin: "헬린이",
    });
    await newCharacter.save();

    const newStory = new Story({
      id: userId,
      episode: 0,
      concern,
      date: new Date(),
    });
    await newStory.save();

    const newFriend = new Friend({
      id: userId,
      win: 0,
      draw: 0,
      lose: 0,
    });
    await newFriend.save();

    res.json({ message: "온보딩 정보가 성공적으로 저장되었습니다." });
  } catch (error) {
    console.error("온보딩 정보 저장 오류:", error);
    res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
  }
});

// 코인 조회 라우터
router.get("/coin", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // 토큰에서 추출한 사용자 ID

    const character = await Character.findOne({ id: userId });
    if (!character) {
      return res.status(404).json({ error: "캐릭터 정보를 찾을 수 없습니다." });
    }

    res.json({ coin: character.coin });
  } catch (error) {
    console.error("코인 조회 오류:", error);
    res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
  }
});

module.exports = router;
