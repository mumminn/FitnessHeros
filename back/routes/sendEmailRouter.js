var express = require("express");
var router = express.Router();
const sendEmail = require("../handlers/sendEmail"); // 실제 이메일 전송 핸들러를 가져옵니다.

router.post(
  "/",
  (req, res, next) => {
    console.log(`Received request to send email with body:`, req.body); // 요청 본문 로그
    next(); // 다음 미들웨어 또는 핸들러로 진행
  },
  sendEmail
); // 이메일 전송 핸들러

module.exports = router;
