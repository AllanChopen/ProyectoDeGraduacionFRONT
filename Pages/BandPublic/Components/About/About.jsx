import './About.css';

function About({ paragraphs }) {
  return (
    <section id="about" className="bp-section bp-about-section" aria-label="About Lost In The Ocean">
      <div className="bp-section-header">
        <h2 className="bp-section-title">Biografia</h2>
        <div className="bp-divider" />
      </div>

      <div className="bp-container bp-about-grid">
        <article className="bp-about-card">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="bp-about-text">
              {paragraph}
            </p>
          ))}
        </article>
      </div>
    </section>
  );
}

export default About;
