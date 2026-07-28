import { useState } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../components/layout/PageHeader";
import {
  AUTH_UNAVAILABLE_MESSAGE,
  type SignupCredentials,
} from "../services/authService";

const initialCredentials: SignupCredentials = {
  email: "",
  password: "",
  passwordConfirmation: "",
  nickname: "",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function SignupPage() {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!credentials.nickname.trim()) {
      setMessage("닉네임을 입력해 주세요.");
      return;
    }

    if (!isValidEmail(credentials.email.trim())) {
      setMessage("올바른 이메일 주소를 입력해 주세요.");
      return;
    }

    if (credentials.password.length < 8) {
      setMessage("비밀번호는 8자 이상 입력해 주세요.");
      return;
    }

    if (credentials.password !== credentials.passwordConfirmation) {
      setMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setMessage(AUTH_UNAVAILABLE_MESSAGE);
  };

  return (
    <section className="page auth-page">
      <PageHeader
        title="회원가입"
        description="인증 서버 연결 전까지는 입력 검증만 제공합니다."
      />
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field" htmlFor="signup-nickname">
          <span>닉네임</span>
          <input
            id="signup-nickname"
            type="text"
            value={credentials.nickname}
            onChange={(event) =>
              setCredentials((current) => ({ ...current, nickname: event.target.value }))
            }
            autoComplete="nickname"
            required
          />
        </label>
        <label className="form-field" htmlFor="signup-email">
          <span>이메일</span>
          <input
            id="signup-email"
            type="email"
            value={credentials.email}
            onChange={(event) =>
              setCredentials((current) => ({ ...current, email: event.target.value }))
            }
            autoComplete="email"
            required
          />
        </label>
        <label className="form-field" htmlFor="signup-password">
          <span>비밀번호</span>
          <input
            id="signup-password"
            type="password"
            value={credentials.password}
            onChange={(event) =>
              setCredentials((current) => ({ ...current, password: event.target.value }))
            }
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label className="form-field" htmlFor="signup-password-confirmation">
          <span>비밀번호 확인</span>
          <input
            id="signup-password-confirmation"
            type="password"
            value={credentials.passwordConfirmation}
            onChange={(event) =>
              setCredentials((current) => ({
                ...current,
                passwordConfirmation: event.target.value,
              }))
            }
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <button className="button button--primary" type="submit">
          회원가입
        </button>
      </form>
      {message ? <p className="form-message">{message}</p> : null}
      <p>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </section>
  );
}

export default SignupPage;
