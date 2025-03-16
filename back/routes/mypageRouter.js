const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');

const secretKey = "hi"; 

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: 'Authorization 토큰이 필요합니다.' });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
};

// GET /api/mypage 엔드포인트
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // 토큰에서 추출한 사용자 ID

    // 데이터베이스에서 사용자 정보 조회
    const user = await User.findOne({ id: userId });

    // 사용자가 존재하지 않는 경우
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자 정보를 JSON 응답으로 전송
    res.json({
      name: user.name || '',
      birthdate: user.birthdate ? user.birthdate.toISOString().split('T')[0] : '',
      gender: user.gender,
      concern: user.concern || ''
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 내부 오류입니다.' });
  }
});

module.exports = router;
