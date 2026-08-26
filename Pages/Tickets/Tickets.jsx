import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import { getManagedShows } from '../BandPublic/bandPublicData';
import '../BandPublic/BandPublic.css';
import '../BandPublic/Components/Shows/Shows.css';
import './Tickets.css';

function Tickets() {
	const [shows, setShows] = useState([]);

	useEffect(() => {
		setShows(getManagedShows());
	}, []);

	return (
		<main className="bp-page tickets-page">
			<NavBar />

			<section className="bp-section tickets-hero" aria-label="Encabezado shows">
				<div className="bp-section-header">
					<h1 className="bp-section-title">Todos los Shows</h1>
					<div className="bp-divider" />
					<p className="tickets-subtitle">
						Fechas confirmadas, nuevas ciudades y actualizaciones de boletos.
					</p>
				</div>
				<div className="bp-more-wrap">
					<Link to="/" className="bp-btn bp-btn-ghost">
						Volver al sitio
					</Link>
				</div>
			</section>

			<section className="bp-section" aria-label="Listado completo de shows">
				<div className="bp-container tickets-grid">
					{shows.map((show) => (
						<article className="bp-show-card tickets-show-card" key={show.id}>
							{show.poster ? (
								<img src={show.poster} alt={show.title} className="bp-show-image" />
							) : (
								<div className="bp-show-image bp-image-placeholder" aria-hidden="true" />
							)}
							<div className="bp-card-content">
								<strong>{show.title}</strong>
								<p className="bp-meta">{show.venue}</p>
								<p className="bp-meta">{show.location}</p>
								<p className="bp-meta">{show.date}</p>
								<div className="bp-show-footer">
									<small>{show.status}</small>
									<Link to={`/shows/${show.id}`} className="bp-btn bp-btn-small">
										Comprar
									</Link>
								</div>
							</div>
						</article>
					))}
				</div>
			</section>

			<Footer />
		</main>
	);
}

export default Tickets;
