import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function HomePage() {
  const [serverMessage, setServerMessage] = useState("서버 확인 중...");

  useEffect(() => {
    fetch("http://localhost:3000/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("서버 응답 오류");
        }

        return response.json();
      })
      .then((data) => {
        setServerMessage(data.message);
      })
      .catch((error) => {
        console.error("백엔드 연결 오류:", error);
        setServerMessage("백엔드 연결 실패");
      });
  }, []);

  const menus = [
    {
      title: "검색",
      description: "원하는 제철 음식과 장소를 찾아보세요.",
      emoji: "🔍",
      path: "/search",
    },
    {
      title: "지도",
      description: "내 주변의 제철 장소를 지도에서 확인해요.",
      emoji: "🗺️",
      path: "/map",
    },
    {
      title: "추천",
      description: "지금 가장 알맞은 제철 콘텐츠를 추천받아요.",
      emoji: "✨",
      path: "/recommend",
    },
    {
      title: "마이페이지",
      description: "저장한 장소와 최근 기록을 확인해요.",
      emoji: "👤",
      path: "/mypage",
    },
  ];

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      <section style={{ marginBottom: "24px" }}>
        <p
          style={{
            margin: 0,
            color: "#ff6b35",
            fontWeight: 700,
          }}
        >
          지금이 가장 맛있는 순간
        </p>

        <h1
          style={{
            margin: "8px 0 12px",
            fontSize: "40px",
          }}
        >
          제철엔
        </h1>

        <p
          style={{
            margin: 0,
            color: "#666666",
            fontSize: "17px",
          }}
        >
          계절에 맞는 음식, 꽃, 축제와 장소를 찾아보세요.
        </p>
      </section>

      <section
        style={{
          marginBottom: "32px",
          padding: "14px 16px",
          borderRadius: "12px",
          backgroundColor:
            serverMessage === "백엔드 연결 실패" ? "#fff0f0" : "#f5f7f9",
          color:
            serverMessage === "백엔드 연결 실패" ? "#d33" : "#333333",
          fontSize: "14px",
        }}
      >
        서버 상태: {serverMessage}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {menus.map((menu) => (
          <Link
            key={menu.path}
            to={menu.path}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <article
              style={{
                minHeight: "170px",
                padding: "24px",
                border: "1px solid #eeeeee",
                borderRadius: "20px",
                backgroundColor: "#ffffff",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div
                style={{
                  fontSize: "34px",
                  marginBottom: "24px",
                }}
              >
                {menu.emoji}
              </div>

              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "21px",
                }}
              >
                {menu.title}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#777777",
                  lineHeight: 1.5,
                  fontSize: "14px",
                }}
              >
                {menu.description}
              </p>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}

export default HomePage;