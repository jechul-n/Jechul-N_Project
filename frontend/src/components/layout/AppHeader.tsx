import { Link } from "react-router-dom";

function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__content">
        <Link className="app-header__brand" to="/" aria-label="제철엔 홈">
          제철엔
        </Link>

        <nav className="app-header__actions" aria-label="보조 메뉴">
          <Link className="app-header__link" to="/search">
            검색
          </Link>
          <Link className="app-header__link" to="/login">
            로그인
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default AppHeader;
