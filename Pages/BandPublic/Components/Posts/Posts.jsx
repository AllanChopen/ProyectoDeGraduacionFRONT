import { Link } from 'react-router-dom';
import './Posts.css';

function Posts({ posts, slug }) {
  return (
    <section id="posts" className="bp-section bp-journal" aria-label="Noticias de la banda">
      <div className="bp-section-header">
        <span className="bp-home-eyebrow">04 / Desde dentro</span>
        <h2 className="bp-section-title">EL BACKSTAGE.</h2>
        <p className="bp-section-intro">Historias, novedades y todo lo que viene.</p>
      </div>
      <div className="bp-journal-grid">
        {posts.map((post, index) => (
          <Link to={`/${slug}/blog/${post.id}`} className={`bp-journal-card ${index === 0 ? 'bp-journal-featured' : ''}`} key={post.id}>
            <div className="bp-journal-media">
              {post.image ? <img src={post.image} alt={post.title} loading="lazy" /> : <div className="bp-journal-placeholder" aria-hidden="true">BACK<br />STAGE.</div>}
              <span className="bp-journal-arrow" aria-hidden="true">↗</span>
            </div>
            <div className="bp-journal-copy">
              <span className="bp-home-eyebrow">{post.date || 'Noticias'}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <span className="bp-journal-read">Leer historia <span aria-hidden="true">↗</span></span>
            </div>
          </Link>
        ))}
        {posts.length === 0 ? <p className="bp-home-empty">Muy pronto, más historias de la banda.</p> : null}
      </div>
      <div className="bp-more-wrap"><Link to={`/${slug}/blog`} className="bp-btn">Todas las noticias <span aria-hidden="true">↗</span></Link></div>
    </section>
  );
}

export default Posts;
