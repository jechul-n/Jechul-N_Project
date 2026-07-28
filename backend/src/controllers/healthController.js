function getHealth(_request, response) {
  response.json({
    success: true,
    message: "백엔드 서버가 정상적으로 작동합니다.",
  });
}

module.exports = {
  getHealth,
};
