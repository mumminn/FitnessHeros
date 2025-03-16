const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { handleChallenge } = require("../sockets/inviteFriend");
const { startChallenge } = require("../sockets/startChallenge");

const SECRET_KEY = "hi";

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.users = {}; // 사용자 ID와 소켓 ID 매핑

  io.on("connection", (socket) => {
    const token = socket.handshake.auth.token;
    console.log("New socket connected:", socket.id); // 연결된 소켓 ID 출력
    let userId;
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      userId = decoded.id;
      socket.userId = userId; // 사용자 ID 저장
    } catch (error) {
      console.error("JWT 인증 실패:", error.message);
      return socket.disconnect();
    }

    // 사용자 추가
    if (!io.users[userId]) {
      io.users[userId] = [];
    }
    io.users[userId].push(socket.id);
    console.log("현재 연결된 사용자:", io.users);

    // 사용자 상태 업데이트
    io.emit("userStatusUpdate", io.users);

    // 친구 신청 및 대결 신청 관련 이벤트
    handleChallenge(io, socket);

    // 운동대결 관련 이벤트
    startChallenge(io, socket);

    // 코인 업데이트 이벤트
    socket.on("coinUpdated", () => {
      io.emit("coinUpdated");
      console.log("서버에서 코인업데이트 발생");
    });

    socket.on("disconnect", () => {
      // 사용자 삭제
      io.users[userId] = io.users[userId].filter((id) => id !== socket.id);
      if (io.users[userId].length === 0) {
        delete io.users[userId];
      }
      console.log("사용자 연결 해제:", userId);
      io.emit("userStatusUpdate", io.users);
    });
  });

  return io;
};
