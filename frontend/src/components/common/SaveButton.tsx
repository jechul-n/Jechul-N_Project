interface SaveButtonProps {
  isSaved: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function SaveButton({ isSaved, onClick, disabled = false }: SaveButtonProps) {
  return (
    <button
      className="button button--secondary"
      type="button"
      aria-pressed={isSaved}
      disabled={disabled}
      onClick={onClick}
    >
      {isSaved ? "저장됨" : "저장"}
    </button>
  );
}

export default SaveButton;
