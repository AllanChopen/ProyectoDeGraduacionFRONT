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
      <main className="bp-page blog-page">
        <NavBar />
        <LoadingState label="Cargando blog..." />
        <Footer />
      </main>
    );
  }

  return (
    <main className="bp-page blog-page">
      <NavBar />

      <section className="bp-section blog-hero" aria-label="Encabezado blog">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Blog Completo</h1>
          <div className="bp-divider" />
          <p className="blog-subtitle">
            Noticias, backstage y novedades de Lost In The Ocean en un solo feed.
          </p>
        </div>
        <div className="bp-more-wrap">
          <Link to={`/${slug}`} className="bp-btn bp-btn-ghost">
            Volver al sitio
          </Link>
        </div>
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
                  Ver
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
