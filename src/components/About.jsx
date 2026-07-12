function About() {
  return (
    <section className="section about-section" id="about">
      <div className="section-heading">
        <p className="section-label">About</p>
        <h2>About Me</h2>
      </div>
      <div className="about-grid">
        <div className="about-card">
          <h3>Name</h3>
          <p>Megh Solanki</p>
        </div>
        <div className="about-card">
          <h3>Enrollment No.</h3>
          <p>24IT094</p>
        </div>
        <div className="about-card">
          <h3>College</h3>
          <p>CSPIT, CHARUSAT</p>
        </div>
        <div className="about-card">
          <h3>Branch</h3>
          <p>Information Technology</p>
        </div>
        <div className="about-card about-wide">
          <h3>Passion</h3>
          <p>Web Development, React, AI, Backend Development</p>
        </div>
        <div className="about-card about-wide">
          <h3>Goal</h3>
          <p>Become a skilled Full Stack Developer and build innovative web applications.</p>
        </div>
      </div>
    </section>
  );
}

export default About;
