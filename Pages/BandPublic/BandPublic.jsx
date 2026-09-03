import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './BandPublic.css';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import Hero from './Components/Hero/Hero';
import About from './Components/About/About';
import Products from './Components/Products/Products';
import Shows from './Components/Shows/Shows';
import Posts from './Components/Posts/Posts';
import Contact from './Components/Contact/Contact';
import Newsletter from './Components/Newsletter/Newsletter';
import heroImage from '../../src/assets/hero.png';
import { getPublicBand } from '../../src/api/bandApi';
import { getPublicEvents, mapEventoToCard, sortEventosForDisplay } from '../../src/api/eventosApi';
import { getPublicPosts, mapPublicacionToCard } from '../../src/api/publicacionesApi';
import { getPublicProducts, mapProductoToCard } from '../../src/api/productosApi';

function BandPublic() {
  const { slug } = useParams();
  const [band, setBand] = useState(null);
  const [products, setProducts] = useState([]);
  const [shows, setShows] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadBand = async () => {
      try {
        const data = await getPublicBand(slug);
        setBand(data);
      } catch (error) {
        console.error('Error loading band:', error);
      }
    };

    if (slug) {
      loadBand();
    }
  }, [slug]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getPublicProducts(slug);
        const mappedProducts = data.map((product) => mapProductoToCard(product));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    if (slug) {
      loadProducts();
    }
  }, [slug]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getPublicEvents(slug);
        const mappedEvents = sortEventosForDisplay(data).map(mapEventoToCard);
        setShows(mappedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    if (slug) {
      loadEvents();
    }
  }, [slug]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getPublicPosts(slug);
        const mappedPosts = data.map(mapPublicacionToCard);
        setPosts(mappedPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };

    if (slug) {
      loadPosts();
    }
  }, [slug]);

  return (
    <main className="bp-page">
      <NavBar />
      <Hero title={band?.nombre} subtitle={band?.descripcion} image={band?.imagenUrl || heroImage} />
      <About paragraphs={band?.biografia ? band.biografia.split(/\r?\n\r?\n/) : []} />
      <Products products={products} slug={slug} />
      <Shows shows={shows} slug={slug} />
      <Posts posts={posts} slug={slug} />
      <Contact />
      <Newsletter />
      <Footer />
    </main>
  );
}

export default BandPublic;
