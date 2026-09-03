import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import {
  getPublicProductDetail,
  getPublicProducts,
  mapProductoToDetail
} from '../../src/api/productosApi';
import { useCart } from '../../src/context/CartContext';
import '../BandPublic/BandPublic.css';
import './ProductDetail.css';

function ProductDetail() {
  const { slug, productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { addMerchItem } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const numericProductId = Number(productId);
        if (Number.isInteger(numericProductId) && numericProductId > 0) {
          const data = await getPublicProductDetail(slug, numericProductId);
          setProduct(mapProductoToDetail(data, numericProductId));
          return;
        }

        const list = await getPublicProducts(slug);
        const selected = list.find((item) => item.uuid === productId);
        if (!selected) {
          setProduct(null);
          setNotFound(true);
          return;
        }

        setProduct(mapProductoToDetail(selected));
      } catch (error) {
        console.error('Error loading product detail:', error);
        setProduct(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug && productId) {
      loadProduct();
    }
  }, [slug, productId]);

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

  useEffect(() => {
    setSelectedVariantId(defaultVariant?.id ?? '');
    setQuantity(1);
    setFeedback('');
  }, [defaultVariant?.id]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  }, [product, selectedVariantId, variants]);

  if (loading) {
    return (
      <main className="bp-page product-page">
        <NavBar />
        <section className="bp-section" aria-label="Cargando producto">
          <div className="bp-section-header">
            <h1 className="bp-section-title">Cargando producto...</h1>
            <div className="bp-divider" />
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (!product || notFound) {
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
            <Link to={`/${slug}/store`} className="bp-btn">
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
    if ((selectedVariant.stock ?? 0) < 1 || selectedVariant.available === false) return;

    addMerchItem({
      productId: product.id ?? product.uuid,
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
              value={selectedVariantId}
              onChange={(event) => setSelectedVariantId(event.target.value)}
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id} disabled={variant.available === false || variant.stock < 1}>
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
            <Link to={`/${slug}/store`} className="bp-btn bp-btn-ghost">
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
