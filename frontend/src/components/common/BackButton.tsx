import { useLocation, useNavigate } from "react-router-dom";

interface BackButtonProps {
  fallbackTo?: string;
}

function BackButton({ fallbackTo = "/" }: BackButtonProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1 && location.key !== "default") {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  return (
    <button className="button button--text" type="button" onClick={handleClick}>
      뒤로
    </button>
  );
}

export default BackButton;
