function Projects() {
  const projectData = [
    {
      title: 'Student Portfolio',
      description: 'A modern portfolio website built using React and Vite to showcase college projects, skills, and contact details.',
      tech: 'React, Vite, CSS, JavaScript',
    },
    {
      title: 'ERP Inventory Management System',
      description: 'A backend-driven inventory management system built with Node.js, Express and MySQL for streamlined college administration.',
      tech: 'Node.js, Express, MySQL, REST APIs',
    },
    {
      title: 'Wellness Tracker Portal',
      description: 'A responsive wellness tracker portal created using HTML, CSS and JavaScript to monitor healthy routines and activities.',
      tech: 'HTML, CSS, JavaScript, Responsive Design',
    },
  ];

  return (
    <section className="section projects-section" id="projects">
      <div className="section-heading">
        <p className="section-label">Projects</p>
        <h2>Featured Work</h2>
      </div>
      <div className="projects-grid">
        {projectData.map((project) => (
          <article key={project.title} className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <span className="project-tech">Technologies: {project.tech}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Projects;
