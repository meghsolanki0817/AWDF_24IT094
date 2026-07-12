function Footer({ email }) {
  return (
    <footer className="footer" id="contact">
      <div className="footer-content">
        <div>
          <p className="footer-title">Megh Solanki</p>
          <p>Enrollment No.: 24IT094</p>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
        <p className="copyright">Copyright ©️ 2026 Megh Solanki</p>
      </div>
    </footer>
  );
}

export default Footer;
