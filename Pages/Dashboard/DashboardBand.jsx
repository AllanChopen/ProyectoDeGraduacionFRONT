import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import NavBar from '../../Components/NavBar/NavBar';
import { getBandById, getBands, updateBand } from '../../src/api/bandApi';
import {
  createDashboardSocialLink,
  deleteDashboardSocialLink,
  getDashboardSocialLinks,
  updateDashboardSocialLink,
} from '../../src/api/redSocialApi';
import { useAuth } from '../../src/context/AuthContext';
import '../BandPublic/BandPublic.css';
import './ManageContent.css';

async function resolveManagedBand(bandaId) {
  if (bandaId) {
    return getBandById(bandaId);
  }

  const bands = await getBands();
  return Array.isArray(bands) ? bands[0] ?? null : null;
}

function DashboardBand() {
  const { slug = '' } = useParams();
  const { bandaId } = useAuth();
  const [bandRecord, setBandRecord] = useState(null);
  const [bandForm, setBandForm] = useState({
    nombre: '',
    slug: '',
    genero: '',
    descripcion: '',
    biografia: '',
  });
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [biographyImageFile, setBiographyImageFile] = useState(null);
  const [status, setStatus] = useState('');
  const [socialItems, setSocialItems] = useState([]);
  const [socialEditingId, setSocialEditingId] = useState(null);
  const [socialType, setSocialType] = useState('instagram');
  const [socialName, setSocialName] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [socialStatus, setSocialStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSocial, setIsSavingSocial] = useState(false);

  const loadSocialLinks = async () => {
    const data = await getDashboardSocialLinks();
    const list = Array.isArray(data) ? data : [];
    setSocialItems(
      list.map((entry) => ({
        id: entry?.id,
        uuid: entry?.uuid,
        tipo: String(entry?.tipo || '').trim(),
        nombre: String(entry?.nombre || '').trim(),
        url: String(entry?.url || '').trim(),
      }))
    );
  };

  useEffect(() => {
    let isMounted = true;

    const loadBand = async () => {
      setIsLoading(true);
      try {
        const [nextBand] = await Promise.all([
          resolveManagedBand(bandaId),
          loadSocialLinks(),
        ]);

        if (!isMounted) {
          return;
        }

        setBandRecord(nextBand);
        setBandForm({
          nombre: nextBand?.nombre ?? '',
          slug: nextBand?.slug ?? '',
          genero: nextBand?.genero ?? '',
          descripcion: nextBand?.descripcion ?? '',
          biografia: nextBand?.biografia ?? '',
        });
        setStatus(nextBand ? '' : 'No se encontro una banda para editar.');
        setSocialStatus('');
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setStatus(error.message || 'No se pudo cargar la informacion general de la banda.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBand();

    return () => {
      isMounted = false;
    };
  }, [bandaId]);

  if (isLoading) {
    return (
      <main className="bp-page manage-page">
        <NavBar />
        <LoadingState label="Cargando informacion de la banda..." />
        <Footer />
      </main>
    );
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setBandForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetImageInputs = () => {
    setHeroImageFile(null);
    setBiographyImageFile(null);
  };

  const resetSocialForm = () => {
    setSocialEditingId(null);
    setSocialType('instagram');
    setSocialName('');
    setSocialUrl('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!bandRecord?.id) {
      setStatus('No hay una banda disponible para actualizar.');
      return;
    }

    setIsSubmitting(true);
    setStatus('');

    const payload = {
      nombre: bandForm.nombre.trim(),
      descripcion: bandForm.descripcion.trim(),
      biografia: bandForm.biografia.trim(),
      genero: bandForm.genero.trim(),
      usuarioId: bandRecord.usuarioId,
      slug: bandForm.slug.trim(),
      imagenFile: heroImageFile || undefined,
      biografiaImagenFile: biographyImageFile || undefined,
    };

    try {
      await updateBand(bandRecord.id, payload);
      const nextBand = await resolveManagedBand(bandaId);
      setBandRecord(nextBand);
      setBandForm({
        nombre: nextBand?.nombre ?? '',
        slug: nextBand?.slug ?? '',
        genero: nextBand?.genero ?? '',
        descripcion: nextBand?.descripcion ?? '',
        biografia: nextBand?.biografia ?? '',
      });
      resetImageInputs();
      setStatus('Informacion general actualizada.');
    } catch (error) {
      setStatus(error.message || 'No se pudo actualizar la banda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      tipo: socialType.trim(),
      nombre: socialName.trim(),
      url: socialUrl.trim(),
    };

    if (!payload.tipo || !payload.nombre || !payload.url) {
      setSocialStatus('Completa tipo, nombre y url de la red social.');
      return;
    }

    setIsSavingSocial(true);
    setSocialStatus('');

    try {
      if (socialEditingId) {
        await updateDashboardSocialLink(socialEditingId, payload);
        setSocialStatus('Red social actualizada.');
      } else {
        await createDashboardSocialLink(payload);
        setSocialStatus('Red social agregada.');
      }

      await loadSocialLinks();
      resetSocialForm();
    } catch (error) {
      setSocialStatus(error.message || 'No se pudo guardar la red social.');
    } finally {
      setIsSavingSocial(false);
    }
  };

  const handleEditSocial = (item) => {
    setSocialEditingId(item.id);
    setSocialType(item.tipo || 'instagram');
    setSocialName(item.nombre || '');
    setSocialUrl(item.url || '');
    setSocialStatus('Editando red social.');
  };

  const handleDeleteSocial = async (id) => {
    const shouldDelete = window.confirm('Estas seguro de eliminar esta red social?');
    if (!shouldDelete) {
      return;
    }

    setIsSavingSocial(true);
    setSocialStatus('');

    try {
      await deleteDashboardSocialLink(id);
      setSocialItems((current) => current.filter((item) => item.id !== id));
      if (socialEditingId === id) {
        resetSocialForm();
      }
      setSocialStatus('Red social eliminada.');
    } catch (error) {
      setSocialStatus(error.message || 'No se pudo eliminar la red social.');
    } finally {
      setIsSavingSocial(false);
    }
  };

  return (
    <main className="bp-page manage-page">
      <NavBar />

      <section className="bp-section" aria-label="Edicion de informacion general">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Editar Info</h1>
          <div className="bp-divider" />
          <p className="manage-subtitle">
            Actualiza el contenido principal de la banda y sube las imagenes de encabezado.
          </p>
          <div className="manage-top-actions">
            <Link to={`/${slug}/dashboard`} className="bp-btn bp-btn-small bp-btn-ghost">
              Volver al dashboard
            </Link>
          </div>
        </div>

        <div className="bp-container manage-layout">
          <article className="bp-contact-panel">
            <h2 className="bp-about-title">Informacion general</h2>
            <form className="manage-form" onSubmit={handleSubmit}>
              <input
                className="bp-field"
                name="nombre"
                placeholder="Nombre de la banda"
                value={bandForm.nombre}
                onChange={handleFieldChange}
                disabled={isLoading || !bandRecord}
                required
              />
              <input
                className="bp-field"
                name="slug"
                placeholder="Slug publico"
                value={bandForm.slug}
                onChange={handleFieldChange}
                disabled={isLoading || !bandRecord}
                required
              />
              <input
                className="bp-field"
                name="genero"
                placeholder="Genero"
                value={bandForm.genero}
                onChange={handleFieldChange}
                disabled={isLoading || !bandRecord}
              />
              <textarea
                className="bp-field manage-textarea"
                name="descripcion"
                placeholder="Descripcion corta"
                value={bandForm.descripcion}
                onChange={handleFieldChange}
                disabled={isLoading || !bandRecord}
                required
              />
              <textarea
                className="bp-field manage-textarea"
                name="biografia"
                placeholder="Biografia"
                value={bandForm.biografia}
                onChange={handleFieldChange}
                disabled={isLoading || !bandRecord}
                required
              />
              <label className="bp-meta" htmlFor="band-hero-image">Imagen hero</label>
              <input
                id="band-hero-image"
                className="bp-field"
                type="file"
                accept="image/*"
                onChange={(e) => setHeroImageFile(e.target.files?.[0] ?? null)}
                disabled={isLoading || !bandRecord}
              />
              <label className="bp-meta" htmlFor="band-biography-image">Imagen biografia</label>
              <input
                id="band-biography-image"
                className="bp-field"
                type="file"
                accept="image/*"
                onChange={(e) => setBiographyImageFile(e.target.files?.[0] ?? null)}
                disabled={isLoading || !bandRecord}
              />
            
              <div className="manage-actions">
                <button type="submit" className="bp-btn bp-btn-small" disabled={isLoading || isSubmitting || !bandRecord}>
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
            {status ? <p className="manage-status">{status}</p> : null}

            <div className="manage-section-compact">
              <div className="bp-divider" />

              <h2 className="bp-about-title">Redes sociales</h2>
              <p className="bp-meta">Administra las redes que se publican en el menu y en el footer.</p>

              <form className="manage-form" onSubmit={handleSocialSubmit}>
                <select
                  className="bp-field"
                  value={socialType}
                  onChange={(event) => setSocialType(event.target.value)}
                  disabled={isSavingSocial}
                  required
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="email">Email</option>
                  <option value="youtube">YouTube</option>
                  <option value="spotify">Spotify</option>
                  <option value="otro">Otro</option>
                </select>
                <input
                  className="bp-field"
                  placeholder="Nombre visible"
                  value={socialName}
                  onChange={(event) => setSocialName(event.target.value)}
                  disabled={isSavingSocial}
                  required
                />
                <input
                  className="bp-field"
                  placeholder="URL o correo"
                  value={socialUrl}
                  onChange={(event) => setSocialUrl(event.target.value)}
                  disabled={isSavingSocial}
                  required
                />
                <div className="manage-actions">
                  <button type="submit" className="bp-btn bp-btn-small" disabled={isSavingSocial}>
                    {isSavingSocial ? 'Guardando...' : socialEditingId ? 'Guardar red social' : 'Agregar red social'}
                  </button>
                  {socialEditingId ? (
                    <button type="button" className="bp-btn bp-btn-small bp-btn-ghost" onClick={resetSocialForm} disabled={isSavingSocial}>
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </form>
              {socialStatus ? <p className="manage-status">{socialStatus}</p> : null}
            </div>
          </article>

          <article className="bp-contact-panel">
            <h2 className="bp-about-title">Imagenes actuales</h2>
            {!isLoading && !bandRecord ? <p className="bp-meta">No hay una banda disponible.</p> : null}
            {bandRecord ? (
              <div className="manage-list">
                <article className="manage-item">
                  {bandRecord.imagenUrl ? (
                    <img src={bandRecord.imagenUrl} alt={bandRecord.nombre || 'Hero de la banda'} className="manage-item-image" />
                  ) : (
                    <div className="manage-item-image" aria-hidden="true" />
                  )}
                  <div className="manage-item-copy">
                    <strong>Hero publica</strong>
                    <p className="bp-meta">Se usa en el encabezado principal de la pagina publica.</p>
                    <p className="bp-meta">{bandRecord.imagenUrl || 'Sin imagen cargada.'}</p>
                  </div>
                </article>
                <article className="manage-item">
                  {bandRecord.biografiaImagenUrl ? (
                    <img src={bandRecord.biografiaImagenUrl} alt={bandRecord.nombre || 'Imagen de biografia'} className="manage-item-image" />
                  ) : (
                    <div className="manage-item-image" aria-hidden="true" />
                  )}
                  <div className="manage-item-copy">
                    <strong>Imagen de biografia</strong>
                    <p className="bp-meta">Acompana la seccion de biografia en la pagina publica.</p>
                    <p className="bp-meta">{bandRecord.biografiaImagenUrl || 'Sin imagen cargada.'}</p>
                  </div>
                </article>
              </div>
            ) : null}

            <div className="bp-divider" />
            <h2 className="bp-about-title">Redes configuradas</h2>
            {socialItems.length === 0 ? <p className="bp-meta">Aun no hay redes sociales registradas.</p> : null}
            <div className="manage-variant-list">
              {socialItems.map((item) => (
                <article className="manage-variant-row" key={item.id ?? item.uuid}>
                  <div className="manage-item-copy">
                    <strong>{item.nombre || item.tipo || 'Red social'}</strong>
                    <p className="bp-meta">Tipo: {item.tipo || '-'}</p>
                    <p className="bp-meta">{item.url || '-'}</p>
                  </div>
                  <div className="manage-actions">
                    <button
                      type="button"
                      className="bp-btn bp-btn-small bp-btn-ghost"
                      onClick={() => handleEditSocial(item)}
                      disabled={isSavingSocial}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="bp-btn bp-btn-small bp-btn-ghost"
                      onClick={() => handleDeleteSocial(item.id)}
                      disabled={isSavingSocial}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default DashboardBand;