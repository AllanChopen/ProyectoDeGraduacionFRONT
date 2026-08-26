import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import { getManagedProducts } from '../BandPublic/bandPublicData';
import '../BandPublic/BandPublic.css';
import '../BandPublic/Components/Products/Products.css';
import './store.css';

function Store() {
	const [products, setProducts] = useState([]);

	useEffect(() => {
		setProducts(getManagedProducts());
	}, []);

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
					<Link to="/" className="bp-btn bp-btn-ghost">
						Volver al sitio
					</Link>
				</div>
			</section>

			<section className="bp-section" aria-label="Listado completo de productos">
				<div className="bp-container store-grid">
					{products.map((product) => (
						<article className="bp-product-card store-product-card" key={product.id}>
							{product.image ? (
								<img src={product.image} alt={product.name} className="bp-product-image" />
							) : (
								<div className="bp-image-placeholder" aria-hidden="true" />
							)}
							<div className="bp-card-content">
								<strong>{product.name}</strong>
								<p className="bp-meta">{product.type}</p>
								<p className="bp-price">Q{product.price.toFixed(2)}</p>
								<Link to={`/tienda/producto/${product.id}`} className="bp-btn bp-btn-small">
									Ver
								</Link>
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
