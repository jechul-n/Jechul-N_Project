const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("제철엔 백엔드 서버 실행 중");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "백엔드 서버가 정상적으로 작동합니다.",
  });
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});