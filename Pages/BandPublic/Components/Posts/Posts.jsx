import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Posts.css';

function Posts({ posts, slug }) {
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
  }, [posts]);

  const scrollByCard = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    const card = container.querySelector('.bp-post-card');
    const amount = card ? card.offsetWidth + 16 : Math.round(container.clientWidth * 0.8);
    container.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  return (
    <section id="posts" className="bp-section" aria-label="Latest posts">
      <div className="bp-section-header">
        <h2 className="bp-section-title">Blog</h2>
        <div className="bp-divider" />
      </div>

      <div className="bp-container bp-carousel-wrap">
        <button
          className="bp-nav-arrow bp-prev"
          type="button"
          aria-label="Anterior posts"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
        >
          {'<'}
        </button>
        <button
          className="bp-nav-arrow bp-next"
          type="button"
          aria-label="Siguiente posts"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
        >
          {'>'}
        </button>

        <div className="bp-carousel" ref={containerRef}>
          {posts.map((post) => (
            <article className="bp-post-card" key={post.id}>
              {post.image ? (
                <img src={post.image} alt={post.title} className="bp-post-image" />
              ) : (
                <div className="bp-post-image bp-image-placeholder" aria-hidden="true" />
              )}
              <div className="bp-card-content">
                <strong>{post.title}</strong>
                <p className="bp-meta">{post.excerpt}</p>
                <p className="bp-meta">{post.date}</p>
                <Link to={`/${slug}/blog/${post.id}`} className="bp-btn bp-btn-small bp-card-cta">
                  Ver
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="bp-more-wrap">
        <Link to={`/${slug}/blog`} className="bp-btn">
          Mostrar mas
        </Link>
      </div>
    </section>
  );
}

export default Posts;
