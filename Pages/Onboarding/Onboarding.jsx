import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { getPublicBand, updateMyBandShippingPrice } from '../../src/api/bandApi';
import { createDashboardSocialLink, getDashboardSocialLinks, updateDashboardSocialLink } from '../../src/api/redSocialApi';
import { connectPayments, getBanks, personalizeBand, readOnboarding, saveOnboarding, signup, subscriptionCheckout, subscriptionStatus } from '../../src/api/onboardingApi';
import './Onboarding.css';

const steps = ['Cuenta Backstage', 'Identidad de la banda', 'Personalizar', 'Preview', 'Recibir pagos', 'Suscripción Backstage'];
const socialTypes = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'], ['spotify', 'Spotify'], ['otro', 'Otro']];
const normalizeSlug = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function useFilePreview(file) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!file) return undefined;
    const next = URL.createObjectURL(file);
    // Synchronize React with the browser-owned object URL and release it on cleanup.
    // eslint-disable-next-line react/set-state-in-effect
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return file ? url : '';
}

function Field({ label, hint, children }) {
  return <label className="ob-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Upload({ label, file, onChange, required = false, document = false }) {
  return <Field label={label}><span className="ob-upload"><span aria-hidden="true">↑</span><span>{file?.name || (document ? 'Seleccionar documento' : 'Seleccionar imagen')}<small>{document ? 'PDF, JPG o PNG' : 'JPG, PNG o WebP'}</small></span><input type="file" accept={document ? '.pdf,.jpg,.jpeg,.png' : 'image/jpeg,image/png,image/webp'} required={required} onChange={(event) => onChange(event.target.files?.[0] || null)} /></span></Field>;
}

function ImagePreview({ image, label, placement, variant = '' }) {
  return <figure className={`ob-image-preview ${variant}`}>
    {image ? <img src={image} alt={label} /> : <div className="ob-image-placeholder" aria-hidden="true">▧</div>}
    <figcaption><strong>{label}</strong><span>{placement}</span></figcaption>
  </figure>;
}

function BandPreview({ band, image, logo, biographyImage }) {
  return <div className="ob-browser" aria-label={`Vista previa de ${band.nombre || 'tu banda'}`}>
    <div className="ob-browser-bar"><span aria-hidden="true">● ● ●</span><span>backstage.gt/{band.slug || 'tu-banda'}</span><span aria-hidden="true">↗</span></div>
    <div className="ob-mini-page">
      <div className="ob-mini-nav"><strong>{logo && <img src={logo} alt="" />}{band.nombre || 'TU BANDA'}</strong><span>Shows · Merch · Noticias</span></div>
      <div className="ob-mini-hero"><div><span className="ob-mini-eyebrow">● {band.genero || 'MÚSICA · SHOWS · MERCH'}</span><h3>{band.nombre || 'El próximo capítulo de tu banda.'}</h3><p>{band.descripcion || 'Tu música tiene un nuevo lugar.'}</p><div className="ob-mini-actions"><span>Ver shows ↗</span><span>Explorar merch ↗</span></div></div><figure><div>EL SONIDO TIENE ROSTRO ✳</div>{image ? <img src={image} alt={`Portada de ${band.nombre}`} /> : <div className="ob-mini-art" aria-hidden="true">✳</div>}<figcaption>{band.nombre || 'TU BANDA'} <span>{band.genero || 'Música sin pausa'}</span></figcaption></figure></div>
      <div className="ob-mini-strip">MERCH. <span>SHOWS.</span> NOTICIAS.</div>
      <div className="ob-mini-about">{biographyImage && <img src={biographyImage} alt="Imagen de la biografía" />}<div><span className="ob-mini-eyebrow">DETRÁS DEL SONIDO</span><h4>Conoce a {band.nombre || 'tu banda'}</h4><p>{band.biografia || 'Aquí comienza tu historia. Comparte lo que hace única a tu banda.'}</p></div></div>
    </div>
  </div>;
}

export default function Onboarding({ completed = false }) {
  const { activeSlug } = useAuth();
  return <OnboardingFlow key={activeSlug || 'guest'} completed={completed} />;
}

function OnboardingFlow({ completed = false }) {
  const { activeSlug, token, user, registerSession } = useAuth();
  const navigate = useNavigate();
  const stored = readOnboarding(activeSlug);
  const [step, setStep] = useState(() => completed ? 6 : token ? Math.min(stored.step || 3, 6) : 1);
  const [account, setAccount] = useState({ nombre: '', email: '', password: '', confirm: '' });
  const [identity, setIdentity] = useState({ nombre: '', slug: '', logo: null });
  const [slugEdited, setSlugEdited] = useState(false);
  const [band, setBand] = useState(stored.band || {});
  const [custom, setCustom] = useState({ descripcion: stored.band?.descripcion || '', biografia: stored.band?.biografia || '', genero: stored.band?.genero || '', precioEnvio: stored.band?.precioEnvio ?? 0, portada: null, biografiaImagen: null });
  const [socials, setSocials] = useState(stored.socials || {});
  const [payments, setPayments] = useState({ email: user?.email || '', fullName: user?.nombre || '', phoneNumber: '', holderName: '', bankAccountNumber: '', bankName: '', currency: 'GTQ', bankAccountType: 'checking', taxRegistrationDocument: null, idCardFront: null, idCardBack: null });
  const [busy, setBusy] = useState(false);
  const [bankRequestVersion, setBankRequestVersion] = useState(0);
  const [bankList, setBankList] = useState({ token: '', version: -1, items: [], error: '' });
  const banksLoading = bankList.token !== token || bankList.version !== bankRequestVersion;
  const banks = banksLoading ? [] : bankList.items;
  const banksError = banksLoading ? '' : bankList.error;
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(Boolean(token));
  const [pendingConfirmation, setPendingConfirmation] = useState(completed);
  const [pollVersion, setPollVersion] = useState(0);
  const heading = useRef(null);
  const logoPreview = useFilePreview(identity.logo);
  const coverPreview = useFilePreview(custom.portada);
  const bioPreview = useFilePreview(custom.biografiaImagen);

  useEffect(() => {
    document.title = 'Crea tu Backstage';
  }, []);

  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!token || !activeSlug) return undefined;
    let cancelled = false;
    getPublicBand(activeSlug).then((data) => {
      if (cancelled) return;
      setBand(data);
      setCustom((current) => ({ ...current, descripcion: data.descripcion || '', biografia: data.biografia || '', genero: data.genero || '', precioEnvio: data.precioEnvio ?? 0 }));
      saveOnboarding(activeSlug, { band: data });
    }).catch(() => {
      // Signup/profile responses already provide a preview when the public GET is unavailable.
    });
    getDashboardSocialLinks().then((data) => {
      if (cancelled || !Array.isArray(data)) return;
      setSocials((current) => {
        const next = { ...current };
        for (const entry of data) {
          const tipo = String(entry.tipo || '').toLowerCase();
          if (!socialTypes.some(([key]) => key === tipo)) continue;
          next[tipo] = { ...entry, url: current[tipo]?.url ?? entry.url, savedUrl: entry.url };
        }
        return next;
      });
    }).catch(() => {
      // Locally saved IDs still prevent duplicate writes when resuming in this browser.
    });
    return () => { cancelled = true; };
  }, [activeSlug, token]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    let timer;
    let attempts = 0;
    const controller = new AbortController();
    const check = async () => {
      try {
        const status = await subscriptionStatus(token, { signal: controller.signal });
        if (cancelled) return;
        if (status.hasAccess === true) {
          setHasAccess(true);
          setStep(7);
          saveOnboarding(activeSlug, { step: 7 });
          setNotice('');
          return;
        }
        setHasAccess(false);
        if (completed) {
          setNotice(['paused', 'past_due', 'cancelled'].includes(status.status) ? 'Tu suscripción todavía no está activa. Revisa el estado de tu pago en Recurrente.' : 'Confirmando tu suscripción. La activación puede tardar un momento.');
          attempts += 1;
          if (attempts < 20 && !['paused', 'past_due', 'cancelled'].includes(status.status)) timer = setTimeout(check, 4000);
          else {
            setPendingConfirmation(false);
            if (attempts >= 20) setNotice('Aún no recibimos la confirmación. Puedes volver a consultar o retomar la suscripción.');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setPendingConfirmation(false);
          setError(`No pudimos consultar tu suscripción. ${err.message}`);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    // Start with the next task so StrictMode cleanup can cancel the first request.
    timer = setTimeout(check, 0);
    return () => { cancelled = true; clearTimeout(timer); controller.abort(); };
  }, [activeSlug, token, completed, pollVersion]);

  const go = (next) => {
    if (next === 5) setBankRequestVersion((value) => value + 1);
    setStep(next);
    setError('');
    setNotice('');
    if (token) saveOnboarding(activeSlug, { step: next });
  };
  const changeCustom = (key, value) => setCustom((current) => ({ ...current, [key]: value }));
  const changePayments = (key, value) => setPayments((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (step !== 5 || !token) return undefined;
    let cancelled = false;
    const controller = new AbortController();
    getBanks(token, { signal: controller.signal }).then((data) => {
      if (cancelled) return;
      if (!Array.isArray(data)) throw new Error('La lista de bancos no es válida.');
      const names = new Set();
      const items = data.filter((bank) => {
        if (typeof bank?.name !== 'string' || !bank.name.trim() || names.has(bank.name)) return false;
        names.add(bank.name);
        return true;
      });
      setBankList({ token, version: bankRequestVersion, items, error: items.length ? '' : 'No hay bancos disponibles en este momento.' });
    }).catch((err) => {
      if (!cancelled) setBankList({ token, version: bankRequestVersion, items: [], error: err.status === 401 ? 'Inicia sesión de nuevo para cargar los bancos.' : 'No pudimos cargar los bancos. Inténtalo de nuevo.' });
    });
    return () => { cancelled = true; controller.abort(); };
  }, [step, token, bankRequestVersion]);
  const refreshStatus = () => {
    setError('');
    setChecking(true);
    setPendingConfirmation(completed);
    setPollVersion((value) => value + 1);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (step === 1) {
        if (account.password !== account.confirm) throw new Error('Las contraseñas no coinciden.');
        if (account.nombre.trim().length < 2) throw new Error('Escribe tu nombre con al menos 2 caracteres.');
        go(2);
      } else if (step === 2 && token) {
        go(3);
      } else if (step === 2) {
        if (identity.nombre.trim().length < 2 || !normalizeSlug(identity.slug)) throw new Error('Revisa el nombre y la dirección de tu banda.');
        if (!identity.logo) throw new Error('Selecciona el logo de tu banda para continuar.');
        const body = new FormData();
        body.append('nombre', account.nombre.trim());
        body.append('email', account.email.trim());
        body.append('password', account.password);
        body.append('bandaNombre', identity.nombre.trim());
        body.append('slug', normalizeSlug(identity.slug));
        body.append('logo', identity.logo);
        const data = await signup(body);
        registerSession(data);
        setBand(data.banda);
        saveOnboarding(data.banda.slug, { step: 3, band: data.banda });
        setAccount((current) => ({ ...current, password: '', confirm: '' }));
        setPayments((current) => ({ ...current, email: data.user?.email || account.email, fullName: data.user?.nombre || account.nombre }));
        setStep(3);
      } else if (step === 3) {
        // Validate every URL before writing any of the profile requests.
        for (const [tipo] of socialTypes) {
          if (!socials[tipo]?.url?.trim()) continue;
          const url = new URL(socials[tipo].url.trim());
          if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Las redes sociales deben comenzar con https:// o http://.');
        }
        const body = new FormData();
        ['descripcion', 'biografia', 'genero'].forEach((key) => body.append(key, custom[key]));
        if (custom.portada) body.append('portada', custom.portada);
        if (custom.biografiaImagen) body.append('biografiaImagen', custom.biografiaImagen);
        const updated = await personalizeBand(body);
        setBand(updated);
        saveOnboarding(activeSlug, { band: updated });
        await updateMyBandShippingPrice(custom.precioEnvio);
        const savedSocials = { ...socials };
        for (const [tipo, nombre] of socialTypes) {
          const social = savedSocials[tipo];
          const url = social?.url?.trim();
          if (!url || url === social.savedUrl) continue;
          const payload = { tipo, nombre, url };
          const result = social.id ? await updateDashboardSocialLink(social.id, payload) : await createDashboardSocialLink(payload);
          savedSocials[tipo] = { ...result, url, savedUrl: url };
          setSocials({ ...savedSocials });
          saveOnboarding(activeSlug, { socials: savedSocials });
        }
        const previewBand = { ...updated, precioEnvio: Number(custom.precioEnvio) };
        setBand(previewBand);
        saveOnboarding(activeSlug, { band: previewBand });
        go(4);
      } else if (step === 5) {
        if (banksLoading || !banks.some((bank) => bank.name === payments.bankName)) throw new Error('Selecciona un banco de la lista para continuar.');
        const body = new FormData();
        Object.entries(payments).forEach(([key, value]) => { if (value) body.append(key, typeof value === 'string' && key !== 'bankName' ? value.trim() : value); });
        body.append('accountType', 'individual');
        try {
          const result = await connectPayments(body);
          if (result.success !== true) throw new Error('No pudimos configurar la cuenta para recibir pagos.');
        } catch (err) {
          if (err.status !== 409) throw err;
          // The contract defines 409 as an existing connected account.
        }
        saveOnboarding(activeSlug, { connected: true });
        setPayments((current) => ({ ...current, holderName: '', bankAccountNumber: '', taxRegistrationDocument: null, idCardFront: null, idCardBack: null }));
        go(6);
      } else if (step === 6) {
        const result = await subscriptionCheckout();
        const checkout = new URL(result.checkoutUrl);
        if (checkout.protocol !== 'https:') throw new Error('No se recibió un enlace de pago válido.');
        saveOnboarding(activeSlug, { step: 6 });
        window.location.assign(checkout.href);
      }
    } catch (err) {
      setError(err instanceof TypeError ? 'Revisa los enlaces de tus redes sociales o tu conexión e inténtalo de nuevo.' : err.message);
    } finally { setBusy(false); }
  };

  const previewBand = step === 2 ? { nombre: identity.nombre, slug: normalizeSlug(identity.slug) } : { ...band, ...custom, slug: band.slug || activeSlug };
  const previewImage = coverPreview || band.portadaUrl || band.imagenUrl;
  const previewLogo = logoPreview || band.logoUrl;
  const titles = ['Tu próximo capítulo empieza aquí.', 'Dale un nombre a tu sonido.', 'Hazlo tuyo.', 'Tu página ya está lista.', 'Tu música. Tus ingresos.', 'Un Backstage. Todo incluido.', 'Tu Backstage está activo.'];
  const descriptions = ['Crea la cuenta con la que administrarás todo lo que pasa detrás del escenario.', 'Una identidad y una dirección para reunir a tus fans.', 'Cuéntale al mundo quién eres. Podrás editar estos detalles desde tu dashboard.', 'Así se verá el espacio de tu banda. El siguiente paso es preparar tus cobros.', 'Configura tu cuenta en Recurrente para recibir los pagos de tus entradas y merch.', 'Activa tu primer mes gratis. Después, Q99 al mes por tu banda.', 'Todo está listo para empezar a publicar, crear shows y compartir tu merch.'];

  return <div className="ob-page">
    <header className="ob-header"><Link to="/" className="ob-brand" aria-label="Backstage, inicio"><span>✳</span> BACKSTAGE<span>✦</span></Link><Link to="/login">{token ? 'Cambiar de cuenta' : 'Ya tengo una cuenta'} <span aria-hidden="true">↗</span></Link></header>
    <main className="ob-layout">
      <aside className="ob-sidebar"><span className="ob-eyebrow">TU BANDA, EN UN SOLO LUGAR</span><h2>Del Backstage<br />al <em>escenario.</em></h2><ol className="ob-steps" aria-label="Progreso de registro">{steps.map((label, index) => <li key={label} className={step === index + 1 ? 'is-current' : step > index + 1 ? 'is-done' : ''} aria-current={step === index + 1 ? 'step' : undefined}><span>{step > index + 1 ? '✓' : String(index + 1).padStart(2, '0')}</span><div>{label}{step === index + 1 && <small>ESTÁS AQUÍ</small>}</div></li>)}</ol><div className="ob-sidebar-note"><span>✳</span><p>Más música.<br />Menos complicaciones.</p></div></aside>
      <section className={`ob-panel ${step === 4 ? 'ob-panel-preview' : ''}`} aria-labelledby="ob-title">
        <span className="ob-eyebrow">{step === 7 ? '✓ TODO LISTO' : `PASO ${String(step).padStart(2, '0')} / 06 · ${steps[step - 1].toUpperCase()}`}</span>
        <h1 id="ob-title" ref={heading} tabIndex={-1}>{completed && step === 6 ? 'Confirmando tu suscripción.' : titles[step - 1]}</h1><p className="ob-intro">{completed && step === 6 ? 'Esperamos la confirmación de Recurrente para activar tu Backstage.' : descriptions[step - 1]}</p>
        {completed && !token ? <div className="ob-message"><p>Inicia sesión para confirmar la activación de tu Backstage.</p><Link className="ob-button" to="/login" state={{ from: '/onboarding/completed' }}>Iniciar sesión ↗</Link></div> : <>
          {error && <div className="ob-error" role="alert">{error}{token && <button type="button" disabled={checking} onClick={refreshStatus}>Consultar suscripción</button>}</div>}
          {notice && <p className="ob-message" role="status">{notice}</p>}
          <form onSubmit={submit} className="ob-form" key={step}>
            {step === 1 && <><Field label="Tu nombre"><input autoComplete="name" value={account.nombre} minLength={2} required onChange={(e) => setAccount({ ...account, nombre: e.target.value })} placeholder="Nombre del administrador" /></Field><Field label="Email"><input type="email" autoComplete="email" value={account.email} required onChange={(e) => setAccount({ ...account, email: e.target.value })} placeholder="tu@email.com" /></Field><Field label="Contraseña" hint="Al menos 8 caracteres."><input type="password" autoComplete="new-password" minLength={8} value={account.password} required onChange={(e) => setAccount({ ...account, password: e.target.value })} /></Field><Field label="Confirmar contraseña"><input type="password" autoComplete="new-password" minLength={8} value={account.confirm} required onChange={(e) => setAccount({ ...account, confirm: e.target.value })} /></Field></>}
            {step === 2 && <>
              <Field label="Nombre de la banda"><input value={token ? band.nombre || identity.nombre : identity.nombre} readOnly={Boolean(token)} minLength={2} required onChange={(e) => setIdentity({ ...identity, nombre: e.target.value, slug: slugEdited ? identity.slug : normalizeSlug(e.target.value) })} placeholder="Lost in the Ocean" /></Field>
              <Field label="Link" hint="Usa letras minúsculas, números y guiones."><input value={token ? band.slug || activeSlug : identity.slug} readOnly={Boolean(token)} pattern="[a-z0-9]+(-[a-z0-9]+)*" required onChange={(e) => { setSlugEdited(true); setIdentity({ ...identity, slug: e.target.value.toLowerCase() }); }} placeholder="lost-in-the-ocean" /></Field>
              <div className="ob-address"><span aria-hidden="true">↗</span> backstage.gt/<strong>{(token ? band.slug || activeSlug : identity.slug) || 'tu-banda'}</strong></div>
              {token ? <>
                <div className="ob-field"><span>Logo</span>{previewLogo ? <img className="ob-logo-preview" src={previewLogo} alt="Logo de la banda" /> : <small>No se recibió una URL independiente para el logo de tu banda.</small>}</div>
                <p className="ob-hint">La cuenta y la dirección de tu banda ya están guardadas. Puedes seguir personalizando tu página.</p>
              </> : <>
                <Upload label="Logo" required file={identity.logo} onChange={(logo) => setIdentity({ ...identity, logo })} />
                {previewLogo && <img className="ob-logo-preview" src={previewLogo} alt="Logo de la banda" />}
              </>}
            </>}
            {step === 3 && <>
              <div className="ob-field-grid">
                <div className="ob-image-field">
                  <Upload label="Portada" file={custom.portada} onChange={(value) => changeCustom('portada', value)} />
                  <ImagePreview image={previewImage} label="Portada de tu página" placement="Imagen principal del encabezado." />
                </div>
                <div className="ob-image-field">
                  <Upload label="Imagen de biografía" file={custom.biografiaImagen} onChange={(value) => changeCustom('biografiaImagen', value)} />
                  <ImagePreview image={bioPreview || band.biografiaImagenUrl} label="Imagen de biografía" placement="Acompaña la historia de tu banda." variant="ob-biography-preview" />
                </div>
              </div>
              <p className="ob-hint">La portada es la imagen principal de tu página. El logo identifica a tu banda en la navegación.</p>
              {previewLogo && <div className="ob-logo-reference"><img src={previewLogo} alt="Logo de tu banda" /><div><strong>Logo de tu banda</strong><span>Tu identidad en el encabezado.</span></div></div>}
              <Field label="Descripción breve"><input value={custom.descripcion} onChange={(e) => changeCustom('descripcion', e.target.value)} placeholder="Una frase que capture el sonido de tu banda" /></Field>
              <Field label="Biografía"><textarea rows={4} value={custom.biografia} onChange={(e) => changeCustom('biografia', e.target.value)} placeholder="Quiénes son, de dónde vienen y qué los mueve…" /></Field>
              <div className="ob-field-grid">
                <Field label="Género"><input value={custom.genero} onChange={(e) => changeCustom('genero', e.target.value)} placeholder="Rock alternativo" /></Field>
                <Field label="Precio de envío (Q)" hint="Para tus pedidos de merch."><input type="number" min="0" step="0.01" required value={custom.precioEnvio} onChange={(e) => changeCustom('precioEnvio', e.target.value)} /></Field>
              </div>
              <fieldset className="ob-socials"><legend>Redes sociales <small>Opcionales</small></legend>{socialTypes.map(([tipo, nombre]) => <Field key={tipo} label={<span className="ob-social-label"><img src={`/icons/${tipo === 'otro' ? 'link' : tipo}.svg`} alt="" />{nombre}</span>}><input type="url" value={socials[tipo]?.url || ''} required={Boolean(socials[tipo]?.id)} placeholder={tipo === 'otro' ? 'https://tu-sitio.com' : `https://${tipo === 'spotify' ? 'open.spotify' : tipo}.com/…`} onChange={(e) => setSocials({ ...socials, [tipo]: { ...socials[tipo], url: e.target.value } })} /></Field>)}</fieldset>
            </>}
            {step === 4 && <><div className="ob-address"><span className="ob-live-dot" />backstage.gt/<strong>{band.slug || activeSlug}</strong></div><BandPreview band={previewBand} image={previewImage} logo={previewLogo} biographyImage={bioPreview || band.biografiaImagenUrl} /><Link className="ob-preview-link" to={`/${band.slug || activeSlug}`} target="_blank" rel="noopener noreferrer">Ver preview completo <span aria-hidden="true">↗</span></Link></>}
            {step === 5 && <>
              <div className="ob-provider"><span className="ob-live-dot" /><strong>RECURRENTE</strong><small>La pasarela de pagos que usamos para procesar tus ventas y enviarte tus ingresos.</small></div>
              <h3 className="ob-section-title">Datos del representante</h3>
              <Field label="Nombre completo"><input autoComplete="name" required value={payments.fullName} onChange={(e) => changePayments('fullName', e.target.value)} /></Field>
              <div className="ob-field-grid">
                <Field label="Email"><input type="email" autoComplete="email" required value={payments.email} onChange={(e) => changePayments('email', e.target.value)} /></Field>
                <Field label="Teléfono (opcional)"><input type="tel" autoComplete="tel" value={payments.phoneNumber} onChange={(e) => changePayments('phoneNumber', e.target.value)} /></Field>
              </div>
              <h3 className="ob-section-title">Cuenta bancaria</h3>
              <Field label="Nombre del titular"><input required value={payments.holderName} onChange={(e) => changePayments('holderName', e.target.value)} /></Field>
              {banksError && <div className="ob-error" role="alert">{banksError}<button type="button" onClick={() => setBankRequestVersion((value) => value + 1)}>Reintentar carga de bancos</button></div>}
              <div className="ob-field-grid">
                <Field label="Banco">
                  <select required disabled={banksLoading || Boolean(banksError) || busy} aria-busy={banksLoading} value={banks.some((bank) => bank.name === payments.bankName) ? payments.bankName : ''} onChange={(e) => changePayments('bankName', e.target.value)}>
                    <option value="">{banksLoading ? 'Cargando bancos…' : 'Selecciona un banco'}</option>
                    {banks.map((bank) => <option key={bank.name} value={bank.name}>{bank.name}</option>)}
                  </select>
                </Field>
                <Field label="Número de cuenta"><input required inputMode="numeric" value={payments.bankAccountNumber} onChange={(e) => changePayments('bankAccountNumber', e.target.value)} /></Field>
                <Field label="Moneda"><select value={payments.currency} onChange={(e) => changePayments('currency', e.target.value)}><option value="GTQ">Quetzales (GTQ)</option><option value="USD">Dólares (USD)</option></select></Field>
                <Field label="Tipo de cuenta"><select value={payments.bankAccountType} onChange={(e) => changePayments('bankAccountType', e.target.value)}><option value="checking">Monetaria</option><option value="savings">Ahorro</option></select></Field>
              </div>
              <h3 className="ob-section-title">Documentos</h3>
              <Upload label="RTU" document required file={payments.taxRegistrationDocument} onChange={(value) => changePayments('taxRegistrationDocument', value)} />
              <div className="ob-field-grid"><Upload label="DPI · frente" document required file={payments.idCardFront} onChange={(value) => changePayments('idCardFront', value)} /><Upload label="DPI · reverso" document required file={payments.idCardBack} onChange={(value) => changePayments('idCardBack', value)} /></div>
              <p className="ob-hint">Recurrente podrá revisar tus documentos después de configurar la cuenta.</p>
            </>}
            {step === 6 && <>
              <div className="ob-price-card"><span className="ob-price-badge">TU PRIMER MES ES GRATIS</span><h3>Backstage</h3><div className="ob-price">Q99 <span>/ mes</span></div><p>por banda. Con todo incluido.</p><ul>{['Tu página y comunidad', 'Eventos y entradas', 'Merch y pedidos', 'Publicaciones y dashboard'].map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul><div className="ob-price-foot">Hoy: <strong>Q0</strong><br />Después del primer mes: Q99 al mes.<br />Pago recurrente a través de Recurrente.</div></div>
              <button className="ob-preview-link" type="button" disabled={checking} onClick={refreshStatus}>{checking ? 'Consultando…' : 'Consultar activación'} ↻</button>
              <p className="ob-hint">Te llevaremos a Recurrente para completar la suscripción. Tu Backstage se activa al recibir la confirmación.</p>
            </>}
            {step === 7 && hasAccess && <div className="ob-success"><span className="ob-success-mark">✓</span><div className="ob-address">backstage.gt/<strong>{activeSlug}</strong></div><p>Nosotros detrás. Tu música al frente.</p><button type="button" className="ob-button" onClick={() => navigate(`/${activeSlug}/dashboard`, { replace: true })}>Ir al dashboard <span>↗</span></button></div>}
            {step < 7 && <div className="ob-actions">{([2, 3, 4, 5, 6].includes(step) && !(step === 2 && token)) && <button type="button" className="ob-back" disabled={busy} onClick={() => go(step === 6 ? 4 : step - 1)}>← Atrás</button>}{step === 4 ? <button type="button" className="ob-button" onClick={() => go(readOnboarding(activeSlug).connected ? 6 : 5)}>Configurar cobros <span>→</span></button> : <button type="submit" className="ob-button" disabled={busy || (step === 5 && (banksLoading || Boolean(banksError) || !banks.length)) || (step === 6 && (checking || (completed && pendingConfirmation)))}>{busy ? 'Procesando…' : step === 6 ? 'Suscribirme · activar mes gratis' : 'Continuar'}<span aria-hidden="true">→</span></button>}</div>}
          </form>
        </>}
      </section>
    </main><footer className="ob-footer"><span>© {new Date().getFullYear()} Backstage.</span><span>Hecho para bandas. Desde Guatemala. ✳</span></footer>
  </div>;
}
