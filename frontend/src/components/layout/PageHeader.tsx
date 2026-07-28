import type { ReactNode } from "react";

import BackButton from "../common/BackButton";

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  actions?: ReactNode;
}

function PageHeader({
  title,
  description,
  backTo = "/",
  actions,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__top-row">
        <BackButton fallbackTo={backTo} />
        {actions ? <div className="page-header__actions">{actions}</div> : null}
      </div>
      <h1 className="page-header__title">{title}</h1>
      {description ? <p className="page-header__description">{description}</p> : null}
    </header>
  );
}

export default PageHeader;
