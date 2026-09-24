import './Hero.css';

function Hero({ title, subtitle, image, genre }) {
  return (
    <section className="bp-hero" id="hero" aria-label={title || 'La banda'}>
      <div className="bp-hero-inner">
        <div className="bp-hero-copy">
          <span className="bp-home-eyebrow"><span className="bp-home-dot" /> {genre || 'Música · Shows · Merch'}</span>
          <h1 className="bp-hero-title">{title}</h1>
          {subtitle ? <p className="bp-hero-subtitle">{subtitle}</p> : null}
          <div className="bp-hero-actions">
            <a className="bp-btn bp-home-primary" href="#shows">Ver shows <span aria-hidden="true">↗</span></a>
            <a className="bp-hero-shop" href="#products">Explorar merch <span aria-hidden="true">↗</span></a>
          </div>
          <a className="bp-hero-discover" href="#about"><span aria-hidden="true">↓</span> Hay más detrás del sonido</a>
        </div>
        <figure className="bp-hero-poster">
          <div className="bp-poster-meta"><span>EL SONIDO TIENE ROSTRO</span><span aria-hidden="true">✳</span></div>
          <img src={image} alt={title || 'La banda'} fetchPriority="high" />
          <figcaption><span>{title}</span><span>{genre || 'Música sin pausa'}</span></figcaption>
          <a className="bp-poster-seal" href="#shows" aria-label="Explorar los shows"><span>LIVE<br />SHOWS</span><span aria-hidden="true">↗</span></a>
        </figure>
      </div>
      <div className="bp-hero-baseline" aria-hidden="true"><span>MERCH.</span><span>SHOWS.</span><span>NOTICIAS.</span></div>
    </section>
  );
}

export default Hero;
