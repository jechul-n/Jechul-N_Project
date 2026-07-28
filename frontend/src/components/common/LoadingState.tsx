interface LoadingStateProps {
  message?: string;
}

function LoadingState({ message = "불러오는 중입니다." }: LoadingStateProps) {
  return (
    <div className="state-message" role="status">
      {message}
    </div>
  );
}

export default LoadingState;
