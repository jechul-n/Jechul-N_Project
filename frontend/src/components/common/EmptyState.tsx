interface EmptyStateProps {
  title: string;
  description?: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="state-message">
      <h2 className="state-message__title">{title}</h2>
      {description ? <p className="state-message__description">{description}</p> : null}
    </section>
  );
}

export default EmptyState;
