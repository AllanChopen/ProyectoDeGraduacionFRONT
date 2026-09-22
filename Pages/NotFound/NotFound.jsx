import { Link } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import '../BandPublic/BandPublic.css';

function NotFound() {
  return (
    <main className="bp-page">
      <NavBar />
      <section className="bp-section">
        <div className="bp-contact-panel">
          <h1>Página no encontrada</h1>
          <p>La banda, evento o página que buscas no existe o ya no está disponible.</p>
          <Link className="bp-btn" to="/">Volver al inicio</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default NotFound;
