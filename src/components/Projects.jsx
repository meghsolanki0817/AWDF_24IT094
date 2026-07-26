import { useEffect, useState } from 'react';

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const githubUsername = 'meghsolanki';
  const apiUrl = `https://api.github.com/users/${githubUsername}/repos?per_page=50&sort=updated`;

  const fetchRepos = () => {
    setLoading(true);
    setError(null);

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`GitHub API returned ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setRepos(
          data.map((repo) => ({
            id: repo.id,
            name: repo.name,
            description: repo.description || 'No description provided.',
            url: repo.html_url,
            language: repo.language || 'JavaScript',
            stars: repo.stargazers_count,
          }))
        );
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
      <div className="section-heading">
        <p className="section-label">GitHub API</p>
        <h2>Latest Repositories</h2>
      </div>

      <div className="projects-meta">
        <span className="repo-count">Total repos: {repos.length}</span>
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search repositories by name"
          className="repo-search"
          type="search"
          aria-label="Search repositories"
        />
      </div>

      {loading && <div className="message-card">Loading repositories...</div>}

      {error && (
        <div className="message-card message-card--error">
          <p>Failed to load repositories.</p>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchRepos}>
            Retry
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
              <span className="project-tech">Primary language: {repo.language}</span>
              <p className="repo-stars">⭐ {repo.stars} stars</p>
              <a href={repo.url} target="_blank" rel="noreferrer" className="project-link">
                View on GitHub
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Projects;
