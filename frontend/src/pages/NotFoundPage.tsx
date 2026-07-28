import { Link } from "react-router-dom";

import EmptyState from "../components/common/EmptyState";

function NotFoundPage() {
  return (
    <section className="page">
      <EmptyState
        title="페이지를 찾을 수 없습니다."
        description="주소를 다시 확인하거나 홈으로 돌아가 주세요."
      />
      <Link className="button button--primary" to="/">
        홈으로 이동
      </Link>
    </section>
  );
}

export default NotFoundPage;
