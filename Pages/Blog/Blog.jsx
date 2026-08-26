import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import { getManagedPosts } from '../BandPublic/bandPublicData';
import '../BandPublic/BandPublic.css';
import '../BandPublic/Components/Posts/Posts.css';
import './Blog.css';

function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    setPosts(getManagedPosts());
  }, []);

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
          <Link to="/" className="bp-btn bp-btn-ghost">
            Volver al sitio
          </Link>
        </div>
      </section>

      <section className="bp-section" aria-label="Listado completo de publicaciones">
        <div className="bp-container blog-grid">
          {posts.map((post) => (
            <article className="bp-post-card blog-post-card" key={post.id}>
              {post.image ? (
                <img src={post.image} alt={post.title} className="bp-post-image" />
              ) : (
                <div className="bp-post-image bp-image-placeholder" aria-hidden="true" />
              )}
              <div className="bp-card-content">
                <strong>{post.title}</strong>
                <p className="bp-meta">{post.excerpt}</p>
                <div className="bp-show-footer">
                  <small>{post.date}</small>
                  <Link to={`/blog/${post.id}`} className="bp-btn bp-btn-small">
                    Leer
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Blog;
