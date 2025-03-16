const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");

// 중복 ID 체크 API
router.post("/check-id", async (req, res) => {
  const { id } = req.body;
  console.log(id);
  try {
    const userExists = await User.findOne({ id }); // DB에서 userId 검색
    if (userExists) {
      return res.status(200).json({ isAvailable: false }); // 중복된 ID
    }
    return res.status(200).json({ isAvailable: true }); // 사용 가능한 ID
  } catch (err) {
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 회원가입 API
router.post("/", async (req, res) => {
  const { id, password, email } = req.body;

  try {
    // ID 중복 체크
    const userExists = await User.findOne({ id });
    if (userExists) {
      return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
    }

    // 비밀번호 암호화
    const saltRounds = 10; // 암호화 강도
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 새로운 사용자 추가
    const newUser = new User({ id, password: hashedPassword, email });
    await newUser.save(); // MongoDB에 저장

    return res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

module.exports = router;
