import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import { getPublicProducts } from '../../src/api/bandApi';
import '../BandPublic/BandPublic.css';
import '../BandPublic/Components/Products/Products.css';
import './store.css';

function getNumericProductId(product) {
	const candidates = [product?.id, product?.productoId, product?.idProducto, product?.productId];
	for (const candidate of candidates) {
		const value = Number(candidate);
		if (Number.isInteger(value) && value > 0) {
			return value;
		}
	}
	return null;
}

function Store() {
	const { slug } = useParams();
	const [products, setProducts] = useState([]);

	useEffect(() => {
		const loadProducts = async () => {
			try {
				const data = await getPublicProducts(slug);
				const mappedProducts = data.map((product) => ({
					id: getNumericProductId(product),
					uuid: product.uuid,
					name: product.nombre,
					description: product.descripcion,
					price: Number(product.precio ?? 0),
					available: Boolean(product.disponible),
					stock: Number(product.stock ?? 0),
					type: 'Merch oficial',
					image: product.imagenUrl ?? null,
				}));
				setProducts(mappedProducts);
			} catch (error) {
				console.error('Error loading products:', error);
			}
		};

		if (slug) {
			loadProducts();
		}
	}, [slug]);

	return (
		<main className="bp-page store-page">
			<NavBar />

			<section className="bp-section store-hero" aria-label="Encabezado tienda">
				<div className="bp-section-header">
					<h1 className="bp-section-title">Tienda Completa</h1>
					<div className="bp-divider" />
					<p className="store-subtitle">Todo el merch oficial de Lost In The Ocean en un solo lugar.</p>
				</div>
				<div className="bp-more-wrap">
					<Link to={`/${slug}`} className="bp-btn bp-btn-ghost">
						Volver al sitio
					</Link>
				</div>
			</section>

			<section className="bp-section" aria-label="Listado completo de productos">
				<div className="bp-container store-grid">
					{products.map((product) => (
						<article className="bp-product-card store-product-card" key={product.id ?? product.uuid}>
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
			</section>

			<Footer />
		</main>
	);
}

export default Store;
