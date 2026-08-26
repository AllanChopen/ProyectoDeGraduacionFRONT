import { Link, useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import { getPostById } from '../BandPublic/bandPublicData';
import '../BandPublic/BandPublic.css';
import './PostDetail.css';

function PostDetail() {
  const { postId } = useParams();
  const post = getPostById(postId);

  if (!post) {
    return (
      <main className="bp-page post-detail-page">
        <NavBar />
        <section className="bp-section" aria-label="Noticia no encontrada">
          <div className="bp-section-header">
            <h1 className="bp-section-title">Noticia no encontrada</h1>
            <div className="bp-divider" />
            <p className="post-subtitle">La noticia que buscas no existe o ya no esta disponible.</p>
          </div>
          <div className="bp-more-wrap">
            <Link to="/blog" className="bp-btn">
              Volver al blog
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bp-page post-detail-page">
      <NavBar />

      <section className="bp-section post-article" aria-label={`Noticia: ${post.title}`}>
        <header className="post-header">
          <p className="post-kicker">Blog / Noticia</p>
          <h1 className="bp-section-title post-title">{post.title}</h1>
          <div className="bp-divider" />
          <p className="post-date">{post.date}</p>
        </header>

        <div className="post-cover-wrap">
          {post.image ? (
            <img src={post.image} alt={post.title} className="post-cover" />
          ) : (
            <div className="post-cover bp-image-placeholder" aria-hidden="true" />
          )}
        </div>

        <article className="post-content bp-contact-panel">
          <p className="post-lead">{post.excerpt}</p>
          {post.content?.map((paragraph, index) => (
            <p className="post-paragraph" key={index}>
              {paragraph}
            </p>
          ))}

          <div className="post-actions">
            <Link to="/blog" className="bp-btn">
              Volver al blog
            </Link>
            <Link to="/" className="bp-btn bp-btn-ghost">
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
