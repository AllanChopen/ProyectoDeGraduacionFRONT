import { useEffect, useState } from 'react';
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

function BandPublic() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [band, setBand] = useState(null);
  const [products, setProducts] = useState([]);
  const [shows, setShows] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <main className="bp-page">
      <NavBar />
      <Hero title={band?.nombre} subtitle={band?.descripcion} image={band?.imagenUrl || heroImage} />
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
