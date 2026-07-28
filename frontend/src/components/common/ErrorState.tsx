interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

function ErrorState({
  title = "요청을 처리하지 못했습니다.",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="state-message state-message--error" role="alert">
      <h2 className="state-message__title">{title}</h2>
      <p className="state-message__description">{message}</p>
      {onRetry ? (
        <button className="button button--secondary" type="button" onClick={onRetry}>
          다시 시도
        </button>
      ) : null}
    </section>
  );
}

export default ErrorState;
