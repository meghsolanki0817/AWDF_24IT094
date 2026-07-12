import './App.css';
import Header from './components/Header.jsx';
import NavBar from './components/NavBar.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Projects from './components/Projects.jsx';
import Footer from './components/Footer.jsx';

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
  return (
    <div className="app-shell">
      <Header name="Megh Solanki" themeColor="#2563eb" />
      <NavBar />
      <main className="main-content">
        <About />
        <Skills skills={skillList} />
        <Projects />
      </main>
      <Footer email="meghsolanki@example.com" />
    </div>
  );
}

export default App;
