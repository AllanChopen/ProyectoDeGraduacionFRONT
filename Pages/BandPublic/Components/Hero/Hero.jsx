import './Hero.css';

function Hero({ title, subtitle, image }) {
  const heroBackground = `radial-gradient(circle at 70% 15%, rgba(242, 111, 68, 0.45), transparent 42%), linear-gradient(130deg, rgba(9, 9, 10, 0.8), rgba(9, 9, 10, 0.65)), url("${image}")`;

  return (
    <section
      className="bp-hero"
      id="hero"
      aria-label="Hero section"
      style={{ '--bp-hero-image': heroBackground }}
    >
      <img className="bp-hero-mobile-image" src={image} alt={title} aria-hidden="true" />
      <div className="bp-hero-inner">
        <h1 className="bp-hero-title">{title}</h1>
        <p className="bp-hero-subtitle">{subtitle}</p>
      </div>
      <div className="bp-hero-overlay" aria-hidden="true" />
    </section>
  );
}

export default Hero;
