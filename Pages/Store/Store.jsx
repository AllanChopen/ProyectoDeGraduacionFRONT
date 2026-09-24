import PageIntro from '../../Components/BandExperience/PageIntro';
import '../../Components/BandExperience/BandExperience.css';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import { getPublicProducts, mapProductoToCard } from '../../src/api/productosApi';
import '../BandPublic/BandPublic.css';
import '../BandPublic/Components/Products/Products.css';
import './store.css';

function Store() {
	const { slug } = useParams();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadProducts = async () => {
			try {
				setLoading(true);
				const data = await getPublicProducts(slug);
				const mappedProducts = data.map((product) => mapProductoToCard(product));
				setProducts(mappedProducts);
			} catch (error) {
				console.error('Error loading products:', error);
				setProducts([]);
			} finally {
				setLoading(false);
			}
		};

		if (slug) {
			loadProducts();
		}
	}, [slug]);

	if (loading) {
		return (
			<main className="bp-page bp-experience store-page">
				<NavBar />
				<LoadingState label="Cargando tienda..." />
				<Footer />
			</main>
		);
	}

	return (
		<main className="bp-page bp-experience store-page">
			<NavBar />

			<section className="bp-section store-hero" aria-label="Encabezado tienda">
				<PageIntro eyebrow="Merch / La colección" title="FUERA DEL" accent="ESCENARIO." description="El sonido también se lleva contigo. Descubre la colección de la banda." backTo={`/${slug}`} />
				<div className="experience-catalog-bar"><span>{products.length} productos</span><Link to={`/${slug}/carrito`}>Ver carrito ↗</Link></div>
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
										Ver producto ↗
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
				{products.length === 0 ? <p className="experience-empty">El próximo merch de la banda aparecerá aquí.</p> : null}
			</section>

			<Footer />
		</main>
	);
}

export default Store;
