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

const aboutParagraphs = [
  'Fundada en la ciudad de Guatemala, Lost in the Ocean es una banda inspirada en la agresividad de los sonidos distorsionados combinada con la belleza de melodias nostalgicas y letras intencionadas que buscan retar el oido del publico guatemalteco.',
  'Desde su concepcion en 2025, el objetivo principal del proyecto ha sido expandir las barreras entre los generos musicales, con un catalogo de influencias que abarca desde el Punk y el Emo hasta estilos mas actuales como el Metalcore y el Post-hardcore.',
  'Pese a su reciente inicio, la banda ya cuenta con mas de 10 presentaciones, incluyendo en la Interfer, logro que les abrio puertas en la escena y marco la direccion a seguir, ahora enfocada en crear material propio.'
];

const members = [
  'Moises Axpuaca - Vocalista, guitarrista de apoyo',
  'Allan Chopen - Guitarrista',
  'Daniel Saban - Guitarrista, voces de apoyo',
  'Josse Zetina - Bajista, voces de apoyo',
  'Fernando Trigueros - Baterista, voces de apoyo'
];

const products = [
  {
    id: 1,
    name: 'Camiseta LITO Black',
    type: 'Playera',
    price: 140,
    image: heroImage,
    link: '#'
  },
  {
    id: 2,
    name: 'Poster Tour 2026',
    type: 'Poster',
    price: 65,
    image: heroImage,
    link: '#'
  },
  {
    id: 3,
    name: 'Sticker Pack',
    type: 'Accesorio',
    price: 35,
    image: heroImage,
    link: '#'
  }
];

const shows = [
  {
    id: 1,
    title: 'Ritmos En Resistencia',
    venue: 'Interfer',
    location: 'Ciudad de Guatemala, Guatemala',
    date: '14 Sep 2026 - 19:30',
    status: 'Confirmado',
    poster: heroImage,
    link: '#'
  },
  {
    id: 2,
    title: 'Noise Circuit',
    venue: 'La Bodega Sonora',
    location: 'Antigua Guatemala, Guatemala',
    date: '03 Oct 2026 - 20:00',
    status: 'Boletos disponibles',
    poster: heroImage,
    link: '#'
  },
  {
    id: 3,
    title: 'Furia y Melodia',
    venue: 'Distrito Rock',
    location: 'Quetzaltenango, Guatemala',
    date: '25 Oct 2026 - 18:30',
    status: 'Proximamente',
    poster: heroImage,
    link: '#'
  }
];

const posts = [
  {
    id: 1,
    title: 'Nuevo sencillo en produccion',
    excerpt: 'Entramos a estudio para grabar nuestro primer material oficial.',
    date: '02 Ago 2026',
    image: heroImage,
    link: '#'
  },
  {
    id: 2,
    title: 'Backstage de Interfer',
    excerpt: 'Compartimos fotos y momentos del show en Interfer.',
    date: '11 Jul 2026',
    image: heroImage,
    link: '#'
  },
  {
    id: 3,
    title: 'Anuncio de nueva fecha',
    excerpt: 'Nos vemos en Quetzaltenango para cerrar octubre con ruido.',
    date: '22 Jun 2026',
    image: heroImage,
    link: '#'
  }
];

function BandPublic() {
  return (
    <main className="bp-page">
      <NavBar />
      <Hero title="Lost In The Ocean" subtitle="Desde Ciudad de Guatemala." image={heroImage} />
      <About paragraphs={aboutParagraphs} members={members} />
      <Products products={products} />
      <Shows shows={shows} />
      <Posts posts={posts} />
      <Contact />
      <Newsletter />
      <Footer />
    </main>
  );
}

export default BandPublic;
