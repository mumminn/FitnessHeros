const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");
const secretKey = "hi";

// 로그인 경로
router.post("/", async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await User.findOne({ id });
    if (!user) {
      // 사용자 존재하지 않을 경우
      return res.status(401).json({
        ok: false,
        message: "존재하지 않는 ID 입니다.",
        error: "UserNotFound",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // 비밀번호 불일치
      return res.status(401).json({
        message: "비밀번호가 일치하지 않습니다.",
      });
    }

    // 모든 필드가 null인지 확인
    const isFirstTime =
      user.name == null &&
      user.birthdate == null &&
      user.gender == null &&
      user.concern == null &&
      user.character == null;

    const token = jwt.sign({ id: user.id }, secretKey); // 토큰 만료 시간 없앰

    // 로그인 성공 응답
    return res.status(200).json({
      success: true,
      token,
      id: user.id,
      isFirstTime: isFirstTime, // 필드가 모두 null인 경우 true, 아니면 false
    });
  } catch (err) {
    console.error("서버 오류:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
