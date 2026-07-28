export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  passwordConfirmation: string;
  nickname: string;
}

export const AUTH_UNAVAILABLE_MESSAGE =
  "인증 서버가 아직 연결되지 않아 로그인과 회원가입을 완료할 수 없습니다.";
