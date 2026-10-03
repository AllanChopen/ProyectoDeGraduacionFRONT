import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import './Landing.css';

const DEMO_PATH = '/lost-in-the-ocean';
const ASSETS = '/landing';
const features = [
  { id: 'dashboard', icon: 'dashboard', title: 'Dashboard', description: 'Ventas, eventos, productos y actividad de tu banda de un vistazo.', image: 'lito-dashboard.webp', alt: 'Dashboard real de Backstage en modo de demostración, con datos privados de ventas ocultos', label: 'Todo lo que pasa detrás del escenario.' },
  { id: 'pagina', icon: 'globe', title: 'Tu página', description: 'Tu propio espacio público para reunir tu música, tus shows y todo lo que haces.', image: 'lito-public.webp', alt: 'Página pública de Lost In The Ocean en Backstage', label: 'Un lugar para todo lo que eres.' },
  { id: 'eventos', icon: 'ticket', title: 'Eventos y entradas', description: 'Crea eventos, vende entradas y administra asistentes desde un solo lugar.', image: 'lito-events.webp', alt: 'Sección real de eventos y entradas de Lost In The Ocean', label: 'Del próximo show al próximo lleno.' },
  { id: 'merch', icon: 'bag', title: 'Merch', description: 'Publica productos, variaciones, inventario y pedidos. Tu merch, en tu propia tienda.', image: 'lito-merch.webp', alt: 'Tienda real de productos de Lost In The Ocean en Backstage', label: 'Tu música también se lleva puesta.' },
  { id: 'publicaciones', icon: 'news', title: 'Publicaciones', description: 'Mantén a tus seguidores al día sin depender únicamente de redes sociales.', image: 'lito-posts.webp', alt: 'Publicaciones reales de Lost In The Ocean en su página de Backstage', label: 'Tu historia, contada por ti.' },
  { id: 'comunidad', icon: 'people', title: 'Tu comunidad', description: 'Reúne a tus seguidores y mantén una conexión directa con quienes apoyan tu música.', image: 'lito-community.webp', alt: 'Sección de contacto de la página de Lost In The Ocean', label: 'Más cerca de quienes te escuchan.' },
];
const included = [
  'Página pública de tu banda', 'Eventos y entradas', 'Merch y productos',
  'Publicaciones', 'Comunidad y suscriptores', 'Dashboard y estadísticas',
  'Gestión de pedidos', 'Actualizaciones de la plataforma',
];

function Icon({ name, className = '' }) {
  const paths = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    external: <path d="M6 18 18 6M6 6h12v12" />,
    check: <path d="m5 12 4 4L19 6" />,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    ticket: <><path d="M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4Z" /><path d="M15 5v3m0 3v2m0 3v3" /></>,
    bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M9 8V5a3 3 0 0 1 6 0v3" /></>,
    news: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h4v4H7zM15 8h2m-2 4h2M7 16h10" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    play: <path d="m9 5 11 7-11 7V5Z" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return <svg className={`landing-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.arrow}</svg>;
}

function Brand() {
  return <span className="landing-brand"><img className="landing-brand-mark" src="/backstage.svg?v=2" alt="" />BACKSTAGE<span className="landing-brand-period" aria-hidden="true">✦</span></span>;
}

function RegisterLink({ children = 'Crear mi Backstage', className = '' }) {
  return <Link className={`landing-button landing-button-primary ${className}`} to="/register">{children}<Icon name="arrow" /></Link>;
}

function BrowserFrame({ image, alt, address, className = '', eager = false }) {
  return (
    <div className={`landing-browser ${className}`}>
      <div className="landing-browser-bar" aria-hidden="true"><span className="landing-browser-dots"><i /><i /><i /></span><span><Icon name="lock" />{address}</span><Icon name="external" /></div>
      <img src={`${ASSETS}/${image}`} alt={alt} width="1440" height="960" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} />
    </div>
  );
}

function Landing() {
  const { isAuthenticated, activeSlug } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const menuButton = useRef(null);
  const selectedFeature = features[activeFeature];

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const selectFeatureWithKeyboard = (event, index) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % features.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + features.length) % features.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = features.length - 1;
    else return;
    event.preventDefault();
    setActiveFeature(next);
    document.getElementById(`landing-tab-${features[next].id}`)?.focus();
  };

  return (
    <div className="landing-page">
      <a className="landing-skip" href="#landing-main">Saltar al contenido</a>
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <Link to="/" aria-label="Backstage, inicio" onClick={closeMenu}><Brand /></Link>
          {isAuthenticated ? (
            <Link className="landing-button landing-button-small landing-button-primary" to={activeSlug ? `/${activeSlug}/dashboard` : '/login'}>Mi Dashboard<Icon name="arrow" /></Link>
          ) : (
            <>
              <button ref={menuButton} type="button" className="landing-menu-toggle" aria-expanded={menuOpen} aria-controls="landing-navigation" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen((open) => !open)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
              <nav id="landing-navigation" className={`landing-navigation ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
                <a href="#producto" onClick={closeMenu}>Producto</a>
                <a href="#para-bandas" onClick={closeMenu}>Para bandas</a>
                <a href="#precios" onClick={closeMenu}>Precios</a>
                <span className="landing-nav-divider" aria-hidden="true" />
                <Link to="/login" onClick={closeMenu}>Iniciar sesión</Link>
                <RegisterLink className="landing-button-small" />
              </nav>
            </>
          )}
        </div>
      </header>

      <main id="landing-main" tabIndex={-1}>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-container">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow landing-hero-eyebrow"><span className="landing-status-dot" />PARA LOS QUE VIVEN LA MÚSICA</span>
              <h1 id="landing-title">Todo lo que necesita<br />tu banda. <em>En un solo lugar.</em></h1>
              <p className="landing-hero-lead">Tu página, eventos, entradas, merch, contenido y comunidad.</p>
              <p className="landing-hero-description">Backstage centraliza la operación de tu banda<br className="landing-desktop-break" /> para que tú te enfoques en la música.</p>
              <div className="landing-hero-actions"><RegisterLink /><Link to={DEMO_PATH} className="landing-button landing-button-secondary"><Icon name="play" />Ver una banda en Backstage</Link></div>
              <p className="landing-offer">Primer mes gratis <span>·</span> Después <strong>Q99/mes</strong> <span>·</span> Cancela cuando quieras</p>
            </div>
            <div className="landing-hero-preview">
              <div className="landing-preview-orbit" aria-hidden="true" />
              <div className="landing-preview-label landing-preview-label-public"><span className="landing-hand-arrow" aria-hidden="true">↙</span>Tu banda, hacia afuera.</div>
              <BrowserFrame image="lito-public.webp" alt="La página pública real de Lost In The Ocean en Backstage" address="backstage / lost-in-the-ocean" className="landing-hero-public" eager />
              <BrowserFrame image="lito-dashboard.webp" alt="Dashboard de Backstage en modo de demostración, con ventas privadas ocultas" address="backstage / dashboard · demo" className="landing-hero-dashboard" eager />
              <div className="landing-preview-label landing-preview-label-dashboard">Todo bajo control, detrás.<span className="landing-hand-arrow" aria-hidden="true">↗</span></div>
              <div className="landing-preview-caption"><span className="landing-status-dot" />UNA PÁGINA PARA TUS FANS. UN BACKSTAGE PARA TI.</div>
            </div>
          </div>
          <div className="landing-feature-strip" aria-label="Todo en Backstage">{['TU PÁGINA', 'EVENTOS', 'ENTRADAS', 'MERCH', 'CONTENIDO', 'COMUNIDAD'].map((item) => <span key={item}>{item}<span aria-hidden="true">✳</span></span>)}</div>
        </section>

        <section className="landing-container landing-section landing-problem" id="para-bandas" aria-labelledby="problem-title">
          <div className="landing-section-copy"><span className="landing-eyebrow">01 / MENOS PESTAÑAS. MÁS MÚSICA.</span><h2 id="problem-title">Tu banda ya<br />hace todo esto.</h2><p className="landing-large-copy">El problema es que lo hace en cinco lugares diferentes.</p><p>Centraliza tu operación sin cambiar la forma en que haces música.</p></div>
          <div className="landing-consolidation">
            <div className="landing-tool-list">{[['Instagram', 'Promoción', 'ig'], ['WhatsApp', 'Clientes', 'wa'], ['Google Forms', 'Entradas', 'gf'], ['Transferencias', 'Pagos', 'tr'], ['Excel', 'Listas', 'ex']].map(([tool, purpose, code]) => <div className="landing-tool-row" key={tool}><span className={`landing-tool-icon landing-tool-${code}`} aria-hidden="true">{code === 'ig' ? '◎' : code === 'wa' ? '◉' : code === 'gf' ? '▤' : code === 'tr' ? '⇄' : '▦'}</span><strong>{tool}</strong><Icon name="arrow" /><span>{purpose}</span></div>)}</div>
            <div className="landing-consolidation-arrow" aria-hidden="true">↓</div>
            <div className="landing-consolidation-result"><Brand /><span>Todo conectado.</span></div>
          </div>
        </section>

        <section className="landing-product-section" id="producto" aria-labelledby="product-title">
          <div className="landing-container landing-section">
            <div className="landing-section-heading"><div><span className="landing-eyebrow">02 / CONOCE TU NUEVO ESPACIO</span><h2 id="product-title">Tu banda.<br /><em>Tu Backstage.</em></h2></div><p>Desde el primer anuncio hasta la última entrada.<br />Todo lo que necesitas, conectado.</p></div>
            <div className="landing-product-tabs" role="tablist" aria-label="Explora las funciones de Backstage">{features.map((feature, index) => <button key={feature.id} id={`landing-tab-${feature.id}`} type="button" role="tab" aria-selected={activeFeature === index} aria-controls="landing-product-panel" tabIndex={activeFeature === index ? 0 : -1} onClick={() => setActiveFeature(index)} onKeyDown={(event) => selectFeatureWithKeyboard(event, index)}><Icon name={feature.icon} />{feature.title}</button>)}</div>
            <div className="landing-product-panel" role="tabpanel" id="landing-product-panel" aria-labelledby={`landing-tab-${selectedFeature.id}`} tabIndex={0}>
              <div className="landing-product-panel-heading"><span><span className="landing-status-dot" />{selectedFeature.label}</span><span>BACKSTAGE EN ACCIÓN <Icon name="external" /></span></div>
              <BrowserFrame image={selectedFeature.image} alt={selectedFeature.alt} address={`backstage / ${selectedFeature.id === 'dashboard' ? 'dashboard · demo' : 'lost-in-the-ocean'}`} className="landing-product-screen" />
              <p className="landing-screen-note">{selectedFeature.description}</p>
            </div>
            <div className="landing-feature-grid">{features.map((feature, index) => <article key={feature.id}><div className="landing-feature-heading"><Icon name={feature.icon} /><span>0{index + 1}</span></div><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div>
          </div>
        </section>

        <section className="landing-container landing-section landing-connect" aria-labelledby="connect-title">
          <div className="landing-centered-heading"><span className="landing-eyebrow">03 / ASÍ DE SIMPLE</span><h2 id="connect-title">Del Backstage <em>al escenario.</em></h2><p>Publicas una vez. Aparece para tus fans.</p></div>
          <div className="landing-connection-grid">
            <div className="landing-connection-side"><div className="landing-connection-label"><span>01</span><strong>BACKSTAGE</strong><small>Solo tú y tu banda</small></div><BrowserFrame image="lito-dashboard.webp" alt="Panel real de administración de Backstage, con métricas privadas ocultas en esta demo" address="tu espacio de trabajo · demo" /><div className="landing-connection-tags"><span>Dashboard</span><span>Productos</span><span>Eventos</span><span>Publicaciones</span><span>Ventas</span></div></div>
            <span className="landing-connection-arrow" aria-label="Se publica en tu página"><Icon name="arrow" /></span>
            <div className="landing-connection-side"><div className="landing-connection-label"><span>02</span><strong>TU PÁGINA</strong><small>Abierta a tus fans</small></div><BrowserFrame image="lito-public.webp" alt="Página de Lost In The Ocean que ven sus fans" address="backstage / lost-in-the-ocean" /><div className="landing-connection-tags"><span>Próximos eventos</span><span>Merch</span><span>Noticias</span><span>Comunidad</span></div></div>
          </div>
          <p className="landing-connect-note">Tú manejas lo que pasa detrás. Tus fans disfrutan lo que pasa al frente.</p>
        </section>

        <section className="landing-commerce-section" aria-labelledby="commerce-title">
          <div className="landing-container landing-section landing-commerce">
            <div className="landing-section-copy"><span className="landing-eyebrow">04 / LAS CUENTAS, CLARAS</span><h2 id="commerce-title">Tú pones el precio.<br /><em>Tú recibes ese precio.</em></h2><p>Tu trabajo tiene un valor. Tú lo decides.</p><div className="landing-payout"><Icon name="check" /><span>Tu banda recibe <strong>Q100.</strong></span></div><p>La tarifa de servicio de Backstage es pagada por el comprador e incluye el procesamiento del pago.</p><span className="landing-small-print">Tarifa de servicio del 10%, mínimo Q5.</span></div>
            <div className="landing-receipt-wrap"><article className="landing-receipt" aria-label="Ejemplo de compra de una entrada"><div className="landing-receipt-top"><Brand /><span>EJEMPLO DE COMPRA</span></div><span className="landing-receipt-icon"><Icon name="ticket" /></span><h3>Nos vemos<br />en el show.</h3><p>Entrada — Lost In The Ocean</p><dl><div><dt>Entrada</dt><dd>Q100</dd></div><div><dt>Servicio Backstage <span>10%</span></dt><dd>Q10</dd></div><div className="landing-receipt-total"><dt>Total</dt><dd>Q110</dd></div></dl><div className="landing-receipt-band"><span>PARA LA BANDA</span><strong>Q100 <Icon name="check" /></strong></div><div className="landing-receipt-barcode" aria-hidden="true" /><span className="landing-receipt-foot">MÁS MÚSICA. MENOS COMPLICACIONES.</span></article><span className="landing-receipt-annotation">Tu precio se queda contigo. ↗</span></div>
          </div>
        </section>

        <section className="landing-container landing-section landing-pricing" id="precios" aria-labelledby="pricing-title">
          <div className="landing-centered-heading"><span className="landing-eyebrow">05 / TODO INCLUIDO. EN SERIO.</span><h2 id="pricing-title">Sin planes. <em>Sin complicaciones.</em></h2><p>Una banda. Un Backstage. Todo lo que necesitas.</p></div>
          <div className="landing-price-card"><div className="landing-price-main"><span className="landing-price-badge"><span className="landing-status-dot" />TU PRIMER MES VA POR NUESTRA CUENTA</span><div className="landing-price"><span>Q</span>99<span>/mes</span></div><p>por banda. Con todo incluido.</p><RegisterLink /><span className="landing-price-trial">Primer mes gratis. Cancela cuando quieras.</span></div><div className="landing-price-includes"><h3>Tu próximo capítulo incluye:</h3><ul>{included.map((item) => <li key={item}><Icon name="check" />{item}</li>)}</ul></div></div>
          <p className="landing-price-footnote">En ventas realizadas mediante Backstage, el comprador paga una tarifa de servicio del 10% (mínimo Q5).</p>
        </section>

        <section className="landing-container landing-section landing-pilot" aria-labelledby="pilot-title">
          <div className="landing-section-heading"><div><span className="landing-eyebrow">06 / DE LA ESCENA, PARA LA ESCENA</span><h2 id="pilot-title">Construido junto a bandas,<br /><em>para bandas.</em></h2></div><span className="landing-pilot-label"><span className="landing-status-dot" />BANDA PILOTO</span></div>
          <div className="landing-pilot-card"><div className="landing-pilot-photo"><img src={`${ASSETS}/lito-band.jpg`} alt="Lost In The Ocean, banda piloto de Backstage" loading="lazy" width="1600" height="726" /><span className="landing-pilot-photo-caption">LOST IN THE OCEAN / GUATEMALA</span></div><div className="landing-pilot-copy"><span className="landing-eyebrow">ESTO YA SUENA.</span><h3>Lost In<br />The Ocean<span aria-hidden="true">↗</span></h3><p>Eventos, contenido, productos y presencia digital administrados desde Backstage.</p><Link to={DEMO_PATH} className="landing-text-link">Conoce su Backstage<Icon name="external" /></Link><div className="landing-pilot-tags"><span>EVENTOS</span><span>MERCH</span><span>CONTENIDO</span></div></div></div>
        </section>

        <section className="landing-final" aria-labelledby="final-title"><img src={`${ASSETS}/lito-live.jpg`} alt="" loading="lazy" width="1075" height="722" /><div className="landing-container landing-final-content"><span className="landing-eyebrow">EL SIGUIENTE PASO ES TUYO.</span><h2 id="final-title">Tu música merece<br />más que un <em>Linktree.</em></h2><p>Crea el espacio digital de tu banda y administra todo desde un solo lugar.</p><RegisterLink /><span className="landing-final-offer">Primer mes gratis. Después Q99/mes.</span></div></section>
      </main>

      <footer className="landing-footer"><div className="landing-container"><div className="landing-footer-top"><Link to="/" aria-label="Backstage, inicio"><Brand /></Link><p>Tu música al frente. Nosotros detrás.</p><nav aria-label="Navegación del pie de página"><a href="#producto">Producto</a><a href="#precios">Precios</a><Link to={DEMO_PATH}>Ver demo</Link><Link to="/login">Iniciar sesión</Link></nav></div><div className="landing-footer-bottom"><span>© {new Date().getFullYear()} Backstage.</span><span>Hecho para bandas. Desde Guatemala. <span aria-hidden="true">✳</span></span><a href="#landing-main">Volver arriba ↑</a></div></div></footer>
    </div>
  );
}

export default Landing;
