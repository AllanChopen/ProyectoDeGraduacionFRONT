import './About.css';

function About({ paragraphs, image, bandName }) {
  const aboutBackground = image ? `url("${image}")` : 'none';

  return (
    <section
      id="about"
      className="bp-about-section"
      aria-label={`Biografia de ${bandName || 'la banda'}`}
      style={{ '--bp-about-image': aboutBackground }}
    >
      <div className="bp-about-backdrop" aria-hidden="true" />
      <div className="bp-about-inner">
        <article className="bp-about-copy">
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
