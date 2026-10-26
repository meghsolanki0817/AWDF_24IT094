import About from './About.jsx';
import Skills from './Skills.jsx';
import { Link } from 'react-router-dom';

function Home({ skills }) {
  return (
    <div className="home-page">
      <About />
      <Skills skills={skills} />
      <section className="section home-cta-section">
        <div className="section-heading">
          <p className="section-label">Explore More</p>
          <h2>Quick Navigation</h2>
        </div>
        <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
          Explore my latest live GitHub repositories, interactive task manager, and performance benchmarks.
        </p>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Link to="/projects" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            View GitHub Projects &rarr;
          </Link>
          <Link to="/tasks" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block', background: '#059669' }}>
            Task Manager &rarr;
          </Link>
          <Link to="/contact" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block', background: '#6366f1' }}>
            Contact Me &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
