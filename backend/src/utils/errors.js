class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

function errorHandler(error, _request, response, _next) {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message =
    error instanceof AppError
      ? error.message
      : "요청을 처리하는 중 서버 오류가 발생했습니다.";

  if (!(error instanceof AppError)) {
    console.error("처리되지 않은 서버 오류:", error);
  }

  response.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = {
  AppError,
  errorHandler,
};
