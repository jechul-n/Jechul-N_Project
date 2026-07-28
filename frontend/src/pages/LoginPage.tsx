import { useState } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../components/layout/PageHeader";
import {
  AUTH_UNAVAILABLE_MESSAGE,
  type LoginCredentials,
} from "../services/authService";

const initialCredentials: LoginCredentials = {
  email: "",
  password: "",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function LoginPage() {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(credentials.email.trim())) {
      setMessage("올바른 이메일 주소를 입력해 주세요.");
      return;
    }

    if (credentials.password.length < 8) {
      setMessage("비밀번호는 8자 이상 입력해 주세요.");
      return;
    }

    setMessage(AUTH_UNAVAILABLE_MESSAGE);
  };

  return (
    <section className="page auth-page">
      <PageHeader
        title="로그인"
        description="인증 서버 연결 전까지는 입력 검증만 제공합니다."
      />
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field" htmlFor="login-email">
          <span>이메일</span>
          <input
            id="login-email"
            type="email"
            value={credentials.email}
            onChange={(event) =>
              setCredentials((current) => ({ ...current, email: event.target.value }))
            }
            autoComplete="email"
            required
          />
        </label>
        <label className="form-field" htmlFor="login-password">
          <span>비밀번호</span>
          <input
            id="login-password"
            type="password"
            value={credentials.password}
            onChange={(event) =>
              setCredentials((current) => ({ ...current, password: event.target.value }))
            }
            autoComplete="current-password"
            minLength={8}
            required
          />
        </label>
        <button className="button button--primary" type="submit">
          로그인
        </button>
      </form>
      {message ? <p className="form-message">{message}</p> : null}
      <p>
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </p>
    </section>
  );
}

export default LoginPage;
