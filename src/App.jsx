import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header.jsx';
import NavBar from './components/NavBar.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Projects from './components/Projects.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import NotFound from './components/NotFound.jsx';
import Tasks from './components/Tasks.jsx';

const skillList = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Git',
  'GitHub',
  'C Programming',
  'Java',
  'MySQL',
];

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`app-shell ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Header name="Megh Solanki" themeColor="#2563eb" />
      <NavBar onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <>
              <About />
              <Skills skills={skillList} />
              <Projects />
            </>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/skills" element={<Skills skills={skillList} />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer email="meghsolanki@example.com" />
    </div>
  );
}

export default App;
