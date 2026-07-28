import { NavLink } from "react-router-dom";

function BottomNavigation() {
  return (
    <nav className="bottom-navigation" aria-label="주요 메뉴">
      <NavLink to="/" end className={getLinkClassName}>
        홈
      </NavLink>

      <NavLink to="/search" className={getLinkClassName}>
        검색
      </NavLink>

      <NavLink to="/map" className={getLinkClassName}>
        지도
      </NavLink>

      <NavLink to="/saved" className={getLinkClassName}>
        저장
      </NavLink>
    </nav>
  );
}

function getLinkClassName({ isActive }: { isActive: boolean }) {
  return isActive
    ? "bottom-navigation__link bottom-navigation__link--active"
    : "bottom-navigation__link";
}

export default BottomNavigation;
