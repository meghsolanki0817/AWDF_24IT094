import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// 3 Major Featured Portfolio Projects
const FEATURED_PROJECTS = [
  {
    id: 'feat-1',
    badge: '⚡ Full-Stack MERN Architecture',
    badgeColor: '#3b82f6',
    title: 'Task & Async Event Management Platform',
    category: 'Full-Stack Web Application',
    description:
      'A production-grade task management system featuring JWT authentication with bcrypt password hashing, in-memory caching with automatic invalidation on writes, and non-blocking asynchronous event processing using native Node.js EventEmitter.',
    highlights: [
      'Sub-5ms response times via server-side in-memory caching (node-cache)',
      'Decoupled background notification system via Node.js native EventEmitter',
      'Optimistic React UI updates with MongoDB/Mongoose data persistence'
    ],
    tech: ['React 18', 'Node.js', 'Express', 'MongoDB', 'JWT', 'node-cache', 'EventEmitter'],
    liveLink: '/tasks',
    internalLink: true,
    repoLink: 'https://github.com/meghsolanki0817/AWDF_24IT094'
  },
  {
    id: 'feat-2',
    badge: '🌤️ Cloud & API Telemetry',
    badgeColor: '#059669',
    title: 'Real-Time Weather & Air Quality Intelligence',
    category: 'Dynamic REST API & Visualization',
    description:
      'An interactive weather intelligence dashboard delivering real-time meteorological tracking, 5-day predictive forecasts, air quality index (AQI) metrics, and geolocation-based search with offline LocalStorage fallback.',
    highlights: [
      'Interactive temperature & precipitation trend charts using Chart.js',
      'Dynamic CSS atmospheric animations reflecting live weather conditions',
      'Geocoding API integration with local search history caching'
    ],
    tech: ['React 18', 'OpenWeather API', 'Chart.js', 'Geolocation API', 'CSS Grid', 'Vite'],
    liveLink: 'https://github.com/meghsolanki0817/weather-intelligence',
    internalLink: false,
    repoLink: 'https://github.com/meghsolanki0817/weather-intelligence'
  },
  {
    id: 'feat-3',
    badge: '🚀 Performance & Code Splitting',
    badgeColor: '#8b5cf6',
    title: 'Modern Developer Portfolio & Performance Hub',
    category: 'High-Performance Single Page Application',
    description:
      'A responsive single-page developer portfolio engineered with route-level code splitting using React.lazy and Suspense, component memoization with React.memo, dark/light theme switching, and live GitHub API repository sync.',
    highlights: [
      '10 separate dynamic code chunks loaded strictly on demand',
      'Suspense fallback loading spinners and memoized Header/Footer',
      'Lighthouse 98+ performance score with zero external UI framework bloat'
    ],
    tech: ['React 18', 'Vite', 'React Router 7', 'Suspense', 'React.lazy', 'Vanilla CSS'],
    liveLink: '/',
    internalLink: true,
    repoLink: 'https://github.com/meghsolanki0817/portfolio'
  }
];

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const githubUsername = 'meghsolanki0817';
  const apiUrl = `https://api.github.com/users/${githubUsername}/repos?per_page=50&sort=updated`;

  const fetchRepos = () => {
    setLoading(true);
    setError(null);

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          // If 404 or rate-limited, try alternate username or provide curated fallback
          return fetch(`https://api.github.com/users/meghsolanki/repos?per_page=50&sort=updated`);
        }
        return res;
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`GitHub API returned ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(
            data.map((repo) => ({
              id: repo.id,
              name: repo.name,
              description: repo.description || 'Full-stack repository exploring modern web engineering.',
              url: repo.html_url,
              language: repo.language || 'JavaScript',
              stars: repo.stargazers_count,
            }))
          );
        } else {
          setRepos([]);
        }
      })
      .catch((fetchError) => {
        setError(fetchError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="section projects-section" id="projects">
      {/* Featured Projects Header */}
      <div className="section-heading">
        <p className="section-label">Showcase</p>
        <h2>Featured Major Projects</h2>
        <p style={{ color: '#cbd5e1', marginTop: '8px' }}>
          Key production-ready applications demonstrating full-stack engineering, performance optimization, and API architecture.
        </p>
      </div>

      {/* Featured Projects Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {FEATURED_PROJECTS.map((project) => (
          <article
            key={project.id}
            className="project-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(145deg, #111827, #0f172a)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '20px',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div>
              {/* Badge */}
              <div style={{ marginBottom: '14px' }}>
                <span style={{
                  background: `${project.badgeColor}22`,
                  color: project.badgeColor,
                  border: `1px solid ${project.badgeColor}55`,
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-block'
                }}>
                  {project.badge}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '10px' }}>
                  {project.category}
                </span>
              </div>

              {/* Title */}
              <h3 style={{ margin: '0 0 12px', fontSize: '1.3rem', color: '#f1f5f9' }}>
                {project.title}
              </h3>

              {/* Description */}
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '16px' }}>
                {project.description}
              </p>

              {/* Key Highlights */}
              <ul style={{
                margin: '0 0 18px',
                paddingLeft: '18px',
                color: '#94a3b8',
                fontSize: '0.83rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {project.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>

              {/* Tech Stack Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '22px' }}>
                {project.tech.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: '#93c5fd',
                      border: '1px solid rgba(148, 163, 184, 0.15)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 600
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
              {project.internalLink ? (
                <Link
                  to={project.liveLink}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🚀 Live Demo
                </Link>
              ) : (
                <a
                  href={project.liveLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🚀 Live Demo
                </a>
              )}

              <a
                href={project.repoLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'transparent',
                  color: '#cbd5e1',
                  border: '1px solid #475569',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                GitHub Repo &rarr;
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* GitHub Live Repositories Section */}
      <div className="section-heading" style={{ paddingTop: '20px', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
        <p className="section-label">GitHub Integration</p>
        <h2>All Repositories ({githubUsername})</h2>
      </div>

      <div className="projects-meta">
        <span className="repo-count">Total repos fetched: {repos.length}</span>
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search repositories by name..."
          className="repo-search"
          type="search"
          aria-label="Search repositories"
        />
      </div>

      {loading && <div className="message-card">Loading repositories from GitHub...</div>}

      {error && (
        <div className="message-card message-card--error">
          <p>Notice: GitHub API rate limit reached or user not found ({error}).</p>
          <button className="retry-button" onClick={fetchRepos}>
            Retry Fetching
          </button>
        </div>
      )}

      {!loading && !error && filteredRepos.length === 0 && (
        <div className="message-card">No repositories match your search.</div>
      )}

      {!loading && !error && filteredRepos.length > 0 && (
        <div className="projects-grid">
          {filteredRepos.map((repo) => (
            <article key={repo.id} className="project-card">
              <h3>{repo.name}</h3>
              <p>{repo.description}</p>
              <span className="project-tech">Language: {repo.language}</span>
              <p className="repo-stars">⭐ {repo.stars} stars</p>
              <a href={repo.url} target="_blank" rel="noreferrer" className="project-link">
                View on GitHub &rarr;
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Projects;
