function Header({ name, themeColor }) {
  return (
    <header className="header-section" style={{ background: `linear-gradient(135deg, ${themeColor} 0%, #0f172a 100%)` }}>
      <div className="header-content">
        <p className="subheading">Student Portfolio</p>
        <h1>{name}</h1>
        <p className="highlight-text">Enrollment No.: 24IT094</p>
      </div>
    </header>
  );
}

export default Header;
