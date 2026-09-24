import './About.css';

function About({ paragraphs, image, bandName }) {
  return (
    <section id="about" className="bp-about-section" aria-label={`Biografía de ${bandName || 'la banda'}`}>
      <div className="bp-about-inner">
        <figure className="bp-about-photo">
          {image ? <img src={image} alt={bandName || 'La banda'} loading="lazy" /> : <div className="bp-about-monogram" aria-hidden="true">{bandName?.slice(0, 1) || '✳'}</div>}
          <figcaption><span>01 — DETRÁS DEL SONIDO</span><span aria-hidden="true">↗</span></figcaption>
        </figure>
        <div className="bp-about-story">
          <header className="bp-about-heading">
            <span className="bp-home-eyebrow">Nuestra historia</span>
            <h2>Más que<br />un <em>sonido.</em></h2>
          </header>
          <article className="bp-about-copy">
            {paragraphs.map((paragraph) => <p key={paragraph} className="bp-about-text">{paragraph}</p>)}
          </article>
          <span className="bp-about-signature">{bandName}</span>
        </div>
      </div>
    </section>
  );
}

export default About;
