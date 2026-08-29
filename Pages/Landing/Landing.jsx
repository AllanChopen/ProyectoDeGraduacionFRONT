import './Landing.css';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';

function Landing() {
  return (
    <div className="landing-page">
      <NavBar />

      <main className="section">
        <section className="landing-wip">
          <h1 className="section-title">Landing Page</h1>
          <div className="divider"></div>
          <div className="wip-banner">
            <span className="wip-badge">🚧 WORK IN PROGRESS 🚧</span>
            <p>Esta sección está siendo diseñada. Vuelve pronto para ver las bandas destacadas.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Landing;
