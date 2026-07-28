const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});
