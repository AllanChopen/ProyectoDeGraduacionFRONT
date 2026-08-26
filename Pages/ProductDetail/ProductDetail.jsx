import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import { getProductById } from '../BandPublic/bandPublicData';
import { useCart } from '../../src/context/CartContext';
import '../BandPublic/BandPublic.css';
import './ProductDetail.css';

function ProductDetail() {
  const { productId } = useParams();
  const product = getProductById(productId);
  const { addMerchItem } = useCart();

  const variants = product?.variants?.length
    ? product.variants
    : [
        {
          id: `product-${product?.id}-default`,
          label: 'Presentacion unica',
          price: Number(product?.price ?? 0),
          stock: 1
        }
      ];

  const defaultVariant = variants[0] ?? null;
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  }, [product, selectedVariantId, variants]);

  if (!product) {
    return (
      <main className="bp-page product-page">
        <NavBar />
        <section className="bp-section" aria-label="Producto no encontrado">
          <div className="bp-section-header">
            <h1 className="bp-section-title">Producto no encontrado</h1>
            <div className="bp-divider" />
            <p className="product-subtitle">Este producto no existe o fue removido del catalogo.</p>
          </div>
          <div className="bp-more-wrap">
            <Link to="/tienda" className="bp-btn">
              Volver a la tienda
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addMerchItem({
      productId: product.id,
      name: product.name,
      variantId: selectedVariant.id,
      variantLabel: selectedVariant.label,
      unitPrice: selectedVariant.price,
      quantity
    });

    setFeedback('Producto agregado al carrito.');
  };

  const total = selectedVariant ? selectedVariant.price * quantity : 0;

  return (
    <main className="bp-page product-page">
      <NavBar />

      <section className="bp-section product-layout" aria-label={`Detalle de ${product.name}`}>
        <div className="product-media">
          {product.image ? (
            <img src={product.image} alt={product.name} className="product-main-image" />
          ) : (
            <div className="product-main-image bp-image-placeholder" aria-hidden="true" />
          )}
        </div>

        <article className="product-info bp-contact-panel">
          <p className="product-type">{product.type}</p>
          <h1 className="bp-section-title product-title">{product.name}</h1>
          <p className="product-description">{product.description}</p>

          <div className="product-field">
            <label htmlFor="variant" className="product-label">
              Variacion
            </label>
            <select
              id="variant"
              className="bp-field product-select"
              value={selectedVariant?.id ?? ''}
              onChange={(event) => setSelectedVariantId(event.target.value)}
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.label} - Q{variant.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="product-field product-row">
            <div>
              <label htmlFor="quantity" className="product-label">
                Cantidad
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={selectedVariant?.stock ?? 1}
                value={quantity}
                className="bp-field product-qty"
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isNaN(next) || next < 1) return setQuantity(1);
                  const max = selectedVariant?.stock ?? 1;
                  setQuantity(next > max ? max : next);
                }}
              />
            </div>

            <div className="product-stock">
              <span>Disponibles</span>
              <strong>{selectedVariant?.stock ?? 0}</strong>
            </div>
          </div>

          <div className="product-price-wrap">
            <p className="bp-price product-price">Q{selectedVariant?.price.toFixed(2)}</p>
            <p className="product-total">Total: Q{total.toFixed(2)}</p>
          </div>

          <div className="product-actions">
            <button type="button" className="bp-btn" onClick={handleAddToCart}>
              Anadir al carrito
            </button>
            <Link to="/tienda" className="bp-btn bp-btn-ghost">
              Seguir comprando
            </Link>
          </div>

          <p className="product-feedback" role="status">
            {feedback}
          </p>
        </article>
      </section>

      <Footer />
    </main>
  );
}

export default ProductDetail;
