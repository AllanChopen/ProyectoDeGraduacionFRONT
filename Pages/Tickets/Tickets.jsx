import PageIntro from '../../Components/BandExperience/PageIntro';
import '../../Components/BandExperience/BandExperience.css';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import { getPublicEvents, mapEventoToCard, sortEventosForDisplay } from '../../src/api/eventosApi';
import '../BandPublic/BandPublic.css';
import '../BandPublic/Components/Shows/Shows.css';
import './Tickets.css';

function Tickets() {
	const { slug } = useParams();
	const [shows, setShows] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadShows = async () => {
			try {
				setLoading(true);
				const data = await getPublicEvents(slug);
				const mappedEvents = sortEventosForDisplay(data).map(mapEventoToCard);
				setShows(mappedEvents);
			} catch (error) {
				console.error('Error loading events:', error);
			} finally {
				setLoading(false);
			}
		};

		if (slug) {
			loadShows();
		}
	}, [slug]);

	if (loading) {
		return (
			<main className="bp-page bp-experience tickets-page">
				<NavBar />
				<LoadingState label="Cargando shows..." />
				<Footer />
			</main>
		);
	}

	return (
		<main className="bp-page bp-experience tickets-page">
			<NavBar />

			<section className="bp-section tickets-hero" aria-label="Encabezado shows">
				<PageIntro eyebrow="Live / La cartelera" title="NOS VEMOS" accent="EN VIVO." description="Fechas, ciudades y un lugar frente al escenario. Encuentra tu próximo show." backTo={`/${slug}`} />
				<div className="experience-catalog-bar"><span>{shows.length} shows</span><span>Sube el volumen ↗</span></div>
		</section>

		<section className="bp-section" aria-label="Listado completo de shows">
			<div className="bp-container tickets-grid">
				{shows.length > 0 ? (
					shows.map((show) => (
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
								<p className="bp-meta">{show.status}</p>
								<Link to={`/${slug}/shows/${show.id}`} className="bp-btn bp-btn-small bp-card-cta">
									Ver show ↗
								</Link>
							</div>
						</article>
					))
				) : (
					<p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No hay shows disponibles.</p>
				)}
				</div>
			</section>

			<Footer />
		</main>
	);
}

export default Tickets;
