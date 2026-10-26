import { useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header.jsx';
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import LoadingFallback from './components/LoadingFallback.jsx';

// Practical 8: Route-based code splitting with React.lazy() dynamic imports
const Home = lazy(() => import('./components/Home.jsx'));
const About = lazy(() => import('./components/About.jsx'));
const Skills = lazy(() => import('./components/Skills.jsx'));
const Projects = lazy(() => import('./components/Projects.jsx'));
const Contact = lazy(() => import('./components/Contact.jsx'));
const Tasks = lazy(() => import('./components/Tasks.jsx'));
const Auth = lazy(() => import('./components/Auth.jsx'));
const NotFound = lazy(() => import('./components/NotFound.jsx'));

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
        <Suspense fallback={<LoadingFallback message="Loading page component..." />}>
          <Routes>
            <Route path="/" element={<Home skills={skillList} />} />
            <Route path="/about" element={<About />} />
            <Route path="/skills" element={<Skills skills={skillList} />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/login" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer email="meghsolanki@example.com" />
    </div>
  );
}

export default App;
