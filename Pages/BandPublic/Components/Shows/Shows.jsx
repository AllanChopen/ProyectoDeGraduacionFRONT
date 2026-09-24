import { Link } from 'react-router-dom';
import './Shows.css';

function Shows({ shows, slug }) {
  return (
    <section id="shows" className="bp-section bp-shows" aria-label="Shows">
      <div className="bp-section-header">
        <span className="bp-home-eyebrow">03 / Frente al escenario</span>
        <h2 className="bp-section-title">NOS VEMOS<br /><em>EN VIVO.</em></h2>
        <p className="bp-section-intro">Elige tu fecha. Encuentra tu lugar. Vive el sonido.</p>
      </div>
      <div className="bp-live-list">
        {shows.map((show, index) => (
          <article className="bp-live-row" key={show.id}>
            <span className="bp-live-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            {show.poster ? <img src={show.poster} alt={show.title} loading="lazy" /> : <div className="bp-live-placeholder" aria-hidden="true">↗</div>}
            <div className="bp-live-info">
              <p className="bp-live-date">{show.date}</p>
              <h3>{show.title}</h3>
              <p className="bp-meta">{[show.venue, show.location].filter(Boolean).join(' · ')}</p>
            </div>
            <div className="bp-live-action">
              {show.status ? <span className="bp-live-status">{show.status}</span> : null}
              <Link to={`/${slug}/shows/${show.id}`} className="bp-btn bp-btn-small">Ver show <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
        ))}
        {shows.length === 0 ? <p className="bp-home-empty">Las próximas fechas aparecerán aquí. Mantente cerca.</p> : null}
      </div>
      <div className="bp-more-wrap"><Link to={`/${slug}/shows`} className="bp-btn">Todos los shows <span aria-hidden="true">↗</span></Link></div>
    </section>
  );
}

export default Shows;
