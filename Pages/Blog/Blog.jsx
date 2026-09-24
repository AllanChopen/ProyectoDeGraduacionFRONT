import PageIntro from '../../Components/BandExperience/PageIntro';
import '../../Components/BandExperience/BandExperience.css';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import { getPublicPosts, mapPublicacionToCard } from '../../src/api/publicacionesApi';
import '../BandPublic/BandPublic.css';
import '../BandPublic/Components/Posts/Posts.css';
import './Blog.css';

function Blog() {
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await getPublicPosts(slug);
        const mappedPosts = data.map(mapPublicacionToCard);
        setPosts(mappedPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPosts();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="bp-page bp-experience blog-page">
        <NavBar />
        <LoadingState label="Cargando blog..." />
        <Footer />
      </main>
    );
  }

  return (
    <main className="bp-page bp-experience blog-page">
      <NavBar />

      <section className="bp-section blog-hero" aria-label="Encabezado blog">
        <PageIntro eyebrow="Journal / Desde dentro" title="EL" accent="BACKSTAGE." description="Las historias detrás de la música. Noticias, lanzamientos y lo que viene." backTo={`/${slug}`} />
        <div className="experience-catalog-bar"><span>{posts.length} historias</span><span>Detrás del sonido ↗</span></div>
      </section>

      <section className="bp-section" aria-label="Listado completo de publicaciones">
        <div className="bp-container blog-grid">
          {posts.length > 0 ? (
            posts.map((post) => (
            <article className="bp-post-card blog-post-card" key={post.id}>
              {post.image ? (
                <img src={post.image} alt={post.title} className="bp-post-image" />
              ) : (
                <div className="bp-post-image bp-image-placeholder" aria-hidden="true" />
              )}
              <div className="bp-card-content">
                <strong>{post.title}</strong>
                <p className="bp-meta">{post.excerpt}</p>
                <p className="bp-meta">{post.date}</p>
                <Link to={`/${slug}/blog/${post.id}`} className="bp-btn bp-btn-small bp-card-cta">
                  Leer historia ↗
                </Link>
              </div>
            </article>
            ))
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No hay posts disponibles.</p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Blog;
