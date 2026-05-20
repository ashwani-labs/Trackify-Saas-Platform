const PageHeader = ({ breadcrumb, title, subtitle, actions }) => {
  const titleNode =
    typeof title === 'string' ? (
      <h1 className="page-title">{title}</h1>
    ) : (
      <div className="page-header__title">{title}</div>
    );

  return (
    <>
      {breadcrumb && <nav className="page-breadcrumb">{breadcrumb}</nav>}
      <header className="page-header">
        <div>
          {titleNode}
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </header>
    </>
  );
};

export default PageHeader;
