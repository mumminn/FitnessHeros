const jwt = require('jsonwebtoken');
const secretKey = 'hi'; // 서버에서 사용하는 비밀 키

// JWT 검증 미들웨어 (4번)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token> 형식에서 토큰 추출

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // 토큰이 유효하면 사용자 정보 저장 후 다음 미들웨어로 이동
    req.userId = decoded.userId;
    req.name = decoded.name;
    next();
  });
};

module.exports = verifyToken;
