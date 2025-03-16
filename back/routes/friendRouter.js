const express = require("express");
const router = express.Router();
const Friend = require("../models/friend");
const User = require("../models/user");
const Challenge = require("../models/challenge");
const jwt = require("jsonwebtoken");
const secretKey = "hi";

// JWT 토큰에서 id를 추출하는 함수
function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.id;
  } catch (error) {
    return null;
  }
}

// 친구 목록 조회 라우트
router.get("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization token이 필요합니다." });
    }

    const token = authHeader.split(" ")[1];
    const userId = decodeToken(token);
    if (!userId) {
      return res.status(401).json({ error: "유효하지 않은 토큰입니다." });
    }

    const friendInfo = await Friend.findOne({ id: userId });
    if (!friendInfo || !friendInfo.friend) {
      return res.status(404).json({ error: "친구 정보를 찾을 수 없습니다." });
    }

    const friendsData = await Promise.all(
      friendInfo.friend.map(async (friendId) => {
        const friendData = (await Friend.findOne({ id: friendId })) || {
          win: 0,
          draw: 0,
          lose: 0,
        };
        const userData = (await User.findOne({ id: friendId })) || {
          name: "이름 없음",
        };
        return {
          id: friendId,
          name: userData.name,
          win: friendData.win,
          draw: friendData.draw,
          lose: friendData.lose,
        };
      })
    );

    res.json({ friends: friendsData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
  }
});

// 친구 검색 및 추가
router.post("/search", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization token이 필요합니다." });
    }

    const token = authHeader.split(" ")[1];
    const userId = decodeToken(token);
    if (!userId) {
      return res.status(401).json({ error: "유효하지 않은 토큰입니다." });
    }

    const { id: searchId } = req.body;
    if (!searchId) {
      return res.status(400).json({ error: "검색할 친구의 ID가 필요합니다." });
    }

    if (searchId === userId) {
      return res
        .status(400)
        .json({ error: "자신을 친구로 추가할 수 없습니다." });
    }

    const friendData = await Friend.findOne({ id: searchId });
    if (!friendData) {
      return res.status(404).json({ error: "친구를 찾을 수 없습니다." });
    }

    let userFriendData = await Friend.findOne({ id: userId });
    if (!userFriendData) {
      userFriendData = new Friend({ id: userId, friend: [] });
    }

    if (!userFriendData.friend.includes(searchId)) {
      userFriendData.friend.push(searchId);
      await userFriendData.save();
    } else {
      return res
        .status(400)
        .json({ error: "이미 친구 목록에 있는 사용자입니다." });
    }

    res.json({
      message: "친구가 성공적으로 추가되었습니다.",
      friend: { id: friendData.id },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
  }
});

// 친구 초대 라우트
router.post("/invite", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization token이 필요합니다." });
    }

    const token = authHeader.split(" ")[1];
    const userId = decodeToken(token);
    if (!userId) {
      return res.status(401).json({ error: "유효하지 않은 토큰입니다." });
    }

    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({ error: "초대할 친구의 ID가 필요합니다." });
    }

    // 친구가 온라인인지 확인
    const io = req.app.get("io");
    const users = io ? io.users : {};

    console.log("현재 온라인 사용자 상태:", users); // 디버깅용 로그
    console.log(`확인할 친구 ID: ${friendId}`);

    if (!users[friendId]) {
      return res.status(400).json({ error: "친구가 온라인 상태가 아닙니다." });
    }

    res.json({
      message: "친구에게 초대 요청이 전송되었습니다.",
      success: true,
    });
  } catch (error) {
    console.error("초대 처리 중 오류 발생:", error);
    res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
  }
});

module.exports = router;
