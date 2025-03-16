const nodemailer = require('nodemailer');
require('dotenv').config();

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com', // Gmail SMTP 서버
  port: 587, // TLS 포트 (SSL은 465)
  secure: false, // TLS 사용
  auth: {
    user: process.env.NODE_MAILER_ID,
    pass: process.env.NODE_MAILER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// 인증번호를 저장하기 위한 변수
let generatedCode = ''; // 서버에서 생성한 인증번호

const handler = async (req, res) => {
  const { email } = req.body;
  generatedCode = Math.floor(100000 + Math.random() * 900000) + ''; // 6자리 인증번호 생성

  console.log("Received email:", email); // 이메일 확인 로그 추가

  if (email) {
    const mailOptions = {
      from: process.env.NODE_MAILER_ID,
      to: email,
      subject: '[Fitness Heroes] 인증 메일',  // 이메일 제목
      html: `인증번호는 <strong style="color:blue;">${generatedCode}</strong> 입니다.`, // 이메일 본문
    };

    await smtpTransport.sendMail(mailOptions, (error) => {
      if (error) {
          console.error('Email sending error:', error); // 오류 로그 추가
          return res.status(400).json({ ok: false, message: '이메일 전송에 실패했습니다.', error: error.message });
      } else {
          return res.status(200).json({ ok: true, code: generatedCode }); // 응답에 인증번호 포함
      }
      smtpTransport.close(); // 여기서는 메일 발송이 완료된 후에 닫아야 함
    });
  } else {
    return res.status(400).json({ ok: false, message: '이메일 주소가 필요합니다.' });
  }
};

module.exports = handler;
