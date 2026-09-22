import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import {
  getPublicProductDetail,
  getPublicProducts,
  mapProductoToDetail
} from '../../src/api/productosApi';
import { useCart } from '../../src/context/CartContext';
import { getPublicBand, mapBand } from '../../src/api/bandApi';
import { calcularPrecioProductos } from '../../src/utils/productPricing';
import '../BandPublic/BandPublic.css';
import './ProductDetail.css';

function ProductDetail() {
  const { slug, productId } = useParams();
  const [product, setProduct] = useState(null);
  const [band, setBand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { addMerchItem } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const numericProductId = Number(productId);
        const bandData = await getPublicBand(slug);
        setBand(mapBand(bandData));
        if (Number.isInteger(numericProductId) && numericProductId > 0) {
          const data = await getPublicProductDetail(slug, numericProductId);
          const mappedProduct = mapProductoToDetail(data, numericProductId);
          setProduct({ ...mappedProduct, id: numericProductId });
        } else {
          const list = await getPublicProducts(slug);
          const selected = list.find((item) => item.uuid === productId);
          if (!selected) throw new Error('Product not found');
          console.log('PUBLIC PRODUCT RAW:', selected);
          const mappedProduct = mapProductoToDetail(selected);
          const variationProductId = mappedProduct.variants
            .map((variant) => Number(variant.productId))
            .find((id) => Number.isInteger(id) && id > 0);
          setProduct({
            ...mappedProduct,
            id: mappedProduct.id ?? variationProductId ?? null,
          });
        }
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

  const hasTalla = Boolean(product?.hasTalla);

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

  const visibleStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const visiblePrice = Number(product?.price ?? 0);

  if (loading) {
    return (
      <main className="bp-page product-page">
        <NavBar />
        <LoadingState label="Cargando producto..." />
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
    if (!Number.isInteger(Number(product.id)) || Number(product.id) < 1) {
      setFeedback('No se encontró el ID interno del producto.');
      console.error('PRODUCT WITHOUT NUMERIC ID:', product);
      return;
    }

    console.log('PRODUCT BEFORE CART:', product);
    console.log('PRODUCT ID:', product.id, typeof product.id);

    addMerchItem({
      slug,
      productId: product.id,
      name: product.name,
      imageUrl: product.image,
      variantId: selectedVariant.id,
      variantLabel: selectedVariant.label,
      unitPrice: visiblePrice,
      quantity
    });

    setFeedback('Producto agregado al carrito.');
  };

  const total = visiblePrice * quantity;
  const price = calcularPrecioProductos(total, band?.precioEnvio ?? 0);

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

          {hasTalla ? (
            <div className="product-field">
              <label htmlFor="variant" className="product-label">
                Talla
              </label>
              <select
                id="variant"
                className="bp-field product-select"
                value={selectedVariantId}
                onChange={(event) => setSelectedVariantId(event.target.value)}
              >
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id} disabled={variant.available === false || variant.stock < 1}>
                    {variant.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="product-field">
              <div className="product-stock">
                <span>Stock general</span>
                <strong>{visibleStock}</strong>
              </div>
            </div>
          )}

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
              <span>{hasTalla ? 'Disponibles' : 'Stock general'}</span>
              <strong>{visibleStock}</strong>
            </div>
          </div>

          <div className="product-price-wrap">
            <p className="bp-price product-price">Q{visiblePrice.toFixed(2)}</p>
            <div className="product-price-breakdown">
              <p><span>Q{price.subtotal.toFixed(2)}</span><span>Productos</span></p>
              <p><span>Q{price.tarifaServicio.toFixed(2)}</span><span>Tarifa de servicio</span></p>
              {price.costoEnvio > 0 ? <p><span>Q{price.costoEnvio.toFixed(2)}</span><span>Envío</span></p> : null}
              <strong><span>Q{price.total.toFixed(2)}</span><span>Total</span></strong>
            </div>
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
