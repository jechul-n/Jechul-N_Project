import { useLocation, useNavigate } from "react-router-dom";
import figmaBackIcon from "../../assets/figma/icon-saved-back.svg";

interface BackButtonProps {
  fallbackTo?: string;
  iconOnly?: boolean;
}

function BackButton({ fallbackTo = "/", iconOnly = false }: BackButtonProps) {
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
    <button
      className={iconOnly ? "button button--text back-button back-button--icon" : "button button--text"}
      type="button"
      onClick={handleClick}
      aria-label={iconOnly ? "뒤로" : undefined}
    >
      {iconOnly ? (
        <img src={figmaBackIcon} alt="" />
      ) : (
        "뒤로"
      )}
    </button>
  );
}

export default BackButton;
