import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="section notfound-section">
      <div className="notfound-container">
        <h1 className="notfound-code">404</h1>
        <h2>Page Not Found</h2>
        <p>Sorry, the page you're looking for doesn't exist.</p>
        <Link to="/" className="back-home-link">
          Go back to Home
        </Link>
      </div>
    </section>
  );
}

export default NotFound;
