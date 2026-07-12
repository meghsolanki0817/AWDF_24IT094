import { useState } from 'react';

function NavBar() {
  const menuItems = ['Home', 'About', 'Skills', 'Projects', 'Contact'];
  const [activeItem, setActiveItem] = useState('Home');

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="brand">Megh Solanki</div>
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className={item === activeItem ? 'nav-link active' : 'nav-link'}
                onClick={() => setActiveItem(item)}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
