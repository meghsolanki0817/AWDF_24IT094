import './LoadingFallback.css';

function LoadingFallback({ message = 'Loading component...' }) {
  return (
    <div className="loading-fallback" role="status" aria-live="polite">
      <div className="loading-spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="loading-text">{message}</p>
      <span className="loading-subtext">Optimized with React.lazy() &amp; Suspense</span>
    </div>
  );
}

export default LoadingFallback;
