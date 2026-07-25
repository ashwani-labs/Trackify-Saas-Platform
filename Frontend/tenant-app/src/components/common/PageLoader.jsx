const PageLoader = () => (
  <div className="page-loader" role="status" aria-live="polite" aria-label="Loading">
    <div className="page-loader__mark">T</div>
    <div className="page-loader__bar" aria-hidden />
  </div>
);

export default PageLoader;
