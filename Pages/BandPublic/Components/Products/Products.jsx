import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Products.css';

function Products({ products, slug }) {
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
  }, [products]);

  const scrollByCard = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    const card = container.querySelector('.bp-product-card');
    const amount = card ? card.offsetWidth + 16 : Math.round(container.clientWidth * 0.8);
    container.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  return (
    <section id="products" className="bp-section bp-products" aria-label="Productos">
      <div className="bp-section-header">
        <h2 className="bp-section-title">Merch / Productos</h2>
        <div className="bp-divider" />
      </div>

      <div className="bp-container bp-carousel-wrap">
        <button
          className="bp-nav-arrow bp-prev"
          type="button"
          aria-label="Anterior productos"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
        >
          {'<'}
        </button>
        <button
          className="bp-nav-arrow bp-next"
          type="button"
          aria-label="Siguiente productos"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
        >
          {'>'}
        </button>

        <div className="bp-carousel" ref={containerRef}>
          {products.map((product) => (
            <article className="bp-product-card" key={product.id ?? product.uuid}>
              {product.image ? (
                <img src={product.image} alt={product.name} className="bp-product-image" />
              ) : (
                <div className="bp-image-placeholder" aria-hidden="true" />
              )}
              <div className="bp-card-content">
                <strong>{product.name}</strong>
                <p className="bp-meta">{product.type}</p>
                <p className="bp-price">Q{product.price.toFixed(2)}</p>
                {product.id || product.uuid ? (
                  <Link to={`/${slug}/store/product/${product.id ?? product.uuid}`} className="bp-btn bp-btn-small">
                    Ver
                  </Link>
                ) : (
                  <button type="button" className="bp-btn bp-btn-small" disabled>
                    No disponible
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="bp-more-wrap">
        <Link to={`/${slug}/store`} className="bp-btn">
          Ver tienda completa
        </Link>
      </div>
    </section>
  );
}

export default Products;
