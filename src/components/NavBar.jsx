import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function NavBar({ onThemeToggle, isDarkMode }) {
  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Skills', path: '/skills' },
    { name: 'Projects', path: '/projects' },
    { name: 'Contact', path: '/contact' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Login', path: '/login' }
  ];
  
  const [activeItem, setActiveItem] = useState('Home');
  const [searchInput, setSearchInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('taskToken')));

  useEffect(() => {
    const updateAuth = () => setIsAuthenticated(Boolean(localStorage.getItem('taskToken')));
    window.addEventListener('auth-changed', updateAuth);
    window.addEventListener('auth-expired', updateAuth);
    return () => {
      window.removeEventListener('auth-changed', updateAuth);
      window.removeEventListener('auth-expired', updateAuth);
    };
  });

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="brand">Megh Solanki</div>
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={item.name === activeItem ? 'nav-link active' : 'nav-link'}
                onClick={() => setActiveItem(item.name)}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchInput}
            onChange={handleSearchChange}
          />
          <button 
            className="theme-toggle-btn"
            onClick={onThemeToggle}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {isAuthenticated && <button className="logout-btn" onClick={() => { localStorage.removeItem('taskToken'); window.dispatchEvent(new Event('auth-changed')); window.location.href = '/login'; }}>Logout</button>}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
