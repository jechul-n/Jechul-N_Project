const cors = require("cors");
const express = require("express");

const discoverRoutes = require("./routes/discoverRoutes");
const healthRoutes = require("./routes/healthRoutes");
const mapRoutes = require("./routes/mapRoutes");
const seasonalRoutes = require("./routes/seasonalRoutes");
const { AppError, errorHandler } = require("./utils/errors");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/", (_request, response) => {
  response.send("제철엔 백엔드 서버 실행 중");
});

app.use("/api", healthRoutes);
app.use("/api", discoverRoutes);
app.use("/api", seasonalRoutes);
app.use("/api", mapRoutes);

app.use((request, _response, next) => {
  next(new AppError(`${request.method} ${request.path} 경로를 찾을 수 없습니다.`, 404));
});

app.use(errorHandler);

module.exports = app;
