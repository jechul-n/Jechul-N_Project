import { NavLink } from "react-router-dom";

function BottomNavigation() {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "70px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "white",
        borderTop: "1px solid #dddddd",
        zIndex: 1000,
      }}
    >
      <NavLink to="/" style={linkStyle}>
        홈
      </NavLink>

      <NavLink to="/search" style={linkStyle}>
        검색
      </NavLink>

      <NavLink to="/map" style={linkStyle}>
        지도
      </NavLink>

      <NavLink to="/recommend" style={linkStyle}>
        추천
      </NavLink>

      <NavLink to="/mypage" style={linkStyle}>
        마이
      </NavLink>
    </nav>
  );
}

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  textDecoration: "none",
  color: isActive ? "#ff6b35" : "#777777",
  fontWeight: isActive ? "700" : "400",
});

export default BottomNavigation;