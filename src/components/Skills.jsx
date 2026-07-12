function Skills({ skills }) {
  return (
    <section className="section skills-section" id="skills">
      <div className="section-heading">
        <p className="section-label">Skills</p>
        <h2>Technical Skills</h2>
      </div>
      <div className="skills-grid">
        {skills.map((skill) => (
          <div key={skill} className="skill-pill">
            {skill}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;
