const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors"); // CORS 패키지 추가
const http = require("http");

const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const socketHandler = require("./handlers/socketHandler.js");

const app = express();

// 미들웨어 및 데이터베이스 설정
app.use(express.json());
app.use(cors());
connectDB();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 라우터 설정
const protectedRouter = require("./routes/protectedRouter");
const loginRouter = require("./routes/loginRouter");
const signupRouter = require("./routes/signupRouter");
const sendEmailRouter = require("./routes/sendEmailRouter");
const characterRouter = require("./routes/characterRouter");
const userRouter = require("./routes/userRouter");
const storyRouter = require("./routes/storyRouter");
const exerciseRouter = require("./routes/exerciseRouter");
const friendRouter = require("./routes/friendRouter");
const matchRouter = require("./routes/matchRouter"); // 임의로 추가한 matchRouter
// const gameresultRouter = require("./routes/gameresultRouter");

// API 엔드포인트 설정
app.use("/api", protectedRouter);
app.use("/api/sendEmail", sendEmailRouter);
app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/character", characterRouter);
app.use("/api/user", userRouter);
app.use("/api/story", storyRouter);
app.use("/api/exercise", exerciseRouter);
app.use("/api/friend", friendRouter);
app.use("/api/match", matchRouter);
// app.use("/api/gameresult",gameresultRouter);

module.exports = app;
