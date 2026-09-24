import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './BandPublic.css';
import LoadingState from '../../Components/LoadingState/LoadingState';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import Hero from './Components/Hero/Hero';
import About from './Components/About/About';
import Products from './Components/Products/Products';
import Shows from './Components/Shows/Shows';
import Posts from './Components/Posts/Posts';
import Contact from './Components/Contact/Contact';
import heroImage from '../../src/assets/hero.png';
import { getPublicBand, mapBand } from '../../src/api/bandApi';
import { getPublicEvents, mapEventoToCard, sortEventosForDisplay } from '../../src/api/eventosApi';
import { getPublicPosts, mapPublicacionToCard } from '../../src/api/publicacionesApi';
import { getPublicProducts, mapProductoToCard } from '../../src/api/productosApi';
import './BandPresentation.css';

function BandPublic() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [band, setBand] = useState(null);
  const [products, setProducts] = useState([]);
  const [shows, setShows] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const pageRef = useRef(null);

  useEffect(() => {
    if (isLoading || !pageRef.current || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (preference.matches || !target.animate) return;
        const animation = target.animate(
          [{ opacity: 0.35, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' }
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      });
    }, { threshold: 0.08 });
    pageRef.current.querySelectorAll('.bp-section-header, .bp-carousel-wrap, .bp-about-inner, .bp-contact-grid, .bp-live-row, .bp-journal-card')
      .forEach((element) => observer.observe(element));
    const stopMotion = () => {
      if (preference.matches) animations.forEach((animation) => animation.cancel());
    };
    preference.addEventListener('change', stopMotion);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener('change', stopMotion);
    };
  }, [isLoading, slug]);

  useEffect(() => {
    let isMounted = true;

    const loadPageData = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Validate the band first so an invalid slug does not trigger requests
        // for products, shows and posts that cannot belong to it.
        const bandData = await getPublicBand(slug);
        if (!bandData) {
          navigate('/404', { replace: true });
          return;
        }
        const [productsData, eventsData, postsData] = await Promise.all([
          getPublicProducts(slug),
          getPublicEvents(slug),
          getPublicPosts(slug),
        ]);

        if (!isMounted) {
          return;
        }

        setBand(mapBand(bandData));
        setProducts((Array.isArray(productsData) ? productsData : []).map((product) => mapProductoToCard(product)));
        setShows(sortEventosForDisplay(Array.isArray(eventsData) ? eventsData : []).map(mapEventoToCard));
        setPosts((Array.isArray(postsData) ? postsData : []).map(mapPublicacionToCard));
      } catch (error) {
        if (!isMounted) {
          return;
        }
        console.error('Error loading public page data:', error);
        if (error?.message?.includes('404')) {
          navigate('/404', { replace: true });
          return;
        }
        setBand(null);
        setProducts([]);
        setShows([]);
        setPosts([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, [navigate, slug]);

  if (isLoading) {
    return (
      <main className="bp-page">
        <NavBar />
        <LoadingState label="Cargando sitio..." />
        <Footer />
      </main>
    );
  }

  return (
    <main className="bp-page bp-band-home" ref={pageRef}>
      <NavBar />
      <Hero title={band?.nombre} subtitle={band?.descripcion} image={band?.imagenUrl || heroImage} genre={band?.genero} />
      <div className="bp-band-strip" aria-hidden="true">
        <span>{band?.nombre}</span><span>✳</span><span>SUBE EL VOLUMEN</span><span>✳</span><span>{band?.genero || 'LIVE MUSIC'}</span>
      </div>
      <About
        paragraphs={band?.biografia ? band.biografia.split(/\r?\n\r?\n/) : []}
        image={band?.biografiaImagenUrl}
        bandName={band?.nombre}
      />
      <Products products={products} slug={slug} />
      <Shows shows={shows} slug={slug} />
      <Posts posts={posts} slug={slug} />
      <Contact slug={slug} />
      <Footer />
    </main>
  );
}

export default BandPublic;
