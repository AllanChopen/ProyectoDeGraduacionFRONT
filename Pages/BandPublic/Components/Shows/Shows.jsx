import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Shows.css';

function Shows({ shows, slug }) {
  const containerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateButtons = () => {
      setCanPrev(container.scrollLeft > 0);
      setCanNext(container.scrollLeft + container.clientWidth < container.scrollWidth - 1);
    };

    updateButtons();
    container.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);

    return () => {
      container.removeEventListener('scroll', updateButtons);
      window.removeEventListener('resize', updateButtons);
    };
  }, [shows]);

  const scrollByCard = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    const card = container.querySelector('.bp-show-card');
    const amount = card ? card.offsetWidth + 16 : Math.round(container.clientWidth * 0.8);
    container.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  return (
    <section id="shows" className="bp-section bp-shows" aria-label="Upcoming shows">
      <div className="bp-section-header">
        <h2 className="bp-section-title">Shows</h2>
        <div className="bp-divider" />
      </div>

      <div className="bp-container bp-carousel-wrap">
        <button
          className="bp-nav-arrow bp-prev"
          type="button"
          aria-label="Anterior shows"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
        >
          {'<'}
        </button>
        <button
          className="bp-nav-arrow bp-next"
          type="button"
          aria-label="Siguiente shows"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
        >
          {'>'}
        </button>

        <div className="bp-carousel" ref={containerRef}>
          {shows.map((show) => (
            <article className="bp-show-card" key={show.id}>
              {show.poster ? (
                <img src={show.poster} alt={show.title} className="bp-show-image" />
              ) : (
                <div className="bp-show-image bp-image-placeholder" aria-hidden="true" />
              )}
              <div className="bp-card-content">
                <strong>{show.title}</strong>
                <p className="bp-meta">{show.venue}</p>
                <p className="bp-meta">{show.location}</p>
                <p className="bp-meta">{show.date}</p>
                <div className="bp-show-footer">
                  <small>{show.status}</small>
                  <Link to={`/${slug}/shows/${show.id}`} className="bp-btn bp-btn-small">
                    Comprar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="bp-more-wrap">
        <Link to={`/${slug}/shows`} className="bp-btn">
          Mostrar mas shows
        </Link>
      </div>
    </section>
  );
}

export default Shows;
