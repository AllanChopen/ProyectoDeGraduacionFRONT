import './About.css';

function About({ paragraphs, members }) {
  return (
    <section id="about" className="bp-section bp-about-section" aria-label="About Lost In The Ocean">
      <div className="bp-section-header">
        <h2 className="bp-section-title">Biografia</h2>
        <div className="bp-divider" />
      </div>

      <div className="bp-container bp-about-grid">
        <article className="bp-about-card">
          <h3 className="bp-about-title">Lost In The Ocean</h3>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="bp-about-text">
              {paragraph}
            </p>
          ))}
        </article>

        <aside className="bp-about-card">
          <h4 className="bp-about-members-title">Miembros</h4>
          <ul className="bp-member-list">
            {members.map((member) => (
              <li key={member}>{member}</li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default About;
