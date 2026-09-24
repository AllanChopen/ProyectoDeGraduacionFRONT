import '../../Components/BandExperience/BandExperience.css';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import {
  getPublicPostDetail,
  mapPublicacionToDetail
} from '../../src/api/publicacionesApi';
import '../BandPublic/BandPublic.css';
import './PostDetail.css';

function PostDetail() {
  const { slug, postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const data = await getPublicPostDetail(slug, postId);
        const mappedPost = mapPublicacionToDetail(data, postId);
        setPost(mappedPost);
      } catch (err) {
        console.error('Error loading post:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug && postId) {
      loadPost();
    }
  }, [slug, postId]);

  if (loading) {
    return (
      <main className="bp-page bp-experience post-detail-page">
        <NavBar />
        <LoadingState label="Cargando noticia..." />
        <Footer />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="bp-page bp-experience post-detail-page">
        <NavBar />
        <section className="bp-section" aria-label="Noticia no encontrada">
          <div className="bp-section-header">
            <h1 className="bp-section-title">Noticia no encontrada</h1>
            <div className="bp-divider" />
            <p className="post-subtitle">La noticia que buscas no existe o ya no esta disponible.</p>
          </div>
          <div className="bp-more-wrap">
            <Link to={`/${slug}/blog`} className="bp-btn">
              Volver al blog
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bp-page bp-experience post-detail-page">
      <NavBar />

      <section className="bp-section post-article" aria-label={`Noticia: ${post.title}`}>
        <nav className="experience-breadcrumb" aria-label="Ruta de navegación"><Link to={`/${slug}`}>La banda</Link><span aria-hidden="true">/</span><Link to={`/${slug}/blog`}>Backstage</Link></nav>
        <header className="experience-article-header"><p className="experience-eyebrow">Journal / La historia</p><h1>{post.title}</h1><p className="post-date">{post.date}</p></header>
        
        <div className="post-cover-wrap">
          {post.image ? (
            <img src={post.image} alt={post.title} className="post-cover" />
          ) : (
            <div className="post-cover bp-image-placeholder" aria-hidden="true" />
          )}
        </div>

        <article className="post-content bp-contact-panel">
          {post.content?.map((paragraph, index) => (
            <p className="post-paragraph" key={index}>
              {paragraph}
            </p>
          ))}

          <div className="post-actions">
            <Link to={`/${slug}/blog`} className="bp-btn">
              Volver al blog
            </Link>
            <Link to={`/${slug}`} className="bp-btn bp-btn-ghost">
              Ir al inicio
            </Link>
          </div>
        </article>
      </section>

      <Footer />
    </main>
  );
}

export default PostDetail;
