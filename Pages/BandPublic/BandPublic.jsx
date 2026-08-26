import { useEffect, useState } from 'react';
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
import { getManagedPosts, getManagedProducts, getManagedShows } from './bandPublicData';

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

function BandPublic() {
  const [products, setProducts] = useState([]);
  const [shows, setShows] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    setProducts(getManagedProducts());
    setShows(getManagedShows());
    setPosts(getManagedPosts());
  }, []);

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
