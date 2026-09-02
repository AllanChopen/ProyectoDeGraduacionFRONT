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
import { getPublicBand, getPublicPosts, getPublicEvents, getPublicProducts } from '../../src/api/bandApi';

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
          variants: (product.variaciones ?? []).map((variant) => ({
            id: variant.id ?? variant.uuid,
            label: variant.nombre || variant.atributos || 'Variacion',
            price: Number(variant.precio ?? 0),
            stock: Number(variant.stock ?? 0),
            available: Boolean(variant.disponible),
          }))
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

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getPublicEvents(slug);
        // Mapear campos del API al formato esperado
        const mappedEvents = data.map((event) => ({
          id: event.id ?? event.uuid,
          title: event.nombre,
          description: event.descripcion,
          date: new Date(event.fecha).toLocaleDateString('es-ES'),
          time: event.hora,
          venue: event.ubicacion,
          location: event.ubicacion,
          capacity: event.capacidad,
          price: event.precioEntrada,
          status: event.estado,
          poster: null,
        }));
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
        // Mapear campos del API al formato esperado
        const mappedPosts = data.map((post) => ({
          id: post.id ?? post.uuid,
          title: post.titulo,
          excerpt: post.contenido.substring(0, 150) + '...',
          image: post.imagenUrl,
          date: new Date(post.fechaPublicacion).toLocaleDateString('es-ES'),
        }));
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
