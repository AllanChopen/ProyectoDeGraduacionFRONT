import heroImage from '../../src/assets/hero.png';

const PRODUCTS_KEY = 'lito_dashboard_products_v1';
const SHOWS_KEY = 'lito_dashboard_shows_v1';
const POSTS_KEY = 'lito_dashboard_posts_v1';

function readManagedList(key) {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeManagedList(key, list) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(list));
}

function ensureManagedList(key, seed) {
  const saved = readManagedList(key);
  if (saved && saved.length > 0) {
    const merged = [...saved];
    seed.forEach((seedItem) => {
      if (!merged.some((savedItem) => savedItem.id === seedItem.id)) {
        merged.push({ ...seedItem });
      }
    });

    if (merged.length !== saved.length) {
      writeManagedList(key, merged);
    }

    return merged;
  }

  const seeded = seed.map((item) => ({ ...item }));
  writeManagedList(key, seeded);
  return seeded;
}

export const products = [
  {
    id: 1,
    name: 'Camiseta LITO Black',
    type: 'Playera',
    price: 140,
    description:
      'Playera oficial en algodon peinado con estampado frontal de Lost In The Ocean, corte regular y acabado suave.',
    variants: [
      { id: 'lito-black-s', label: 'Negra / S', price: 140, stock: 12 },
      { id: 'lito-black-m', label: 'Negra / M', price: 145, stock: 10 },
      { id: 'lito-black-l', label: 'Negra / L', price: 150, stock: 8 }
    ],
    image: heroImage,
    link: '#'
  },
  {
    id: 2,
    name: 'Poster Tour 2026',
    type: 'Poster',
    price: 65,
    description:
      'Poster con arte oficial de la gira 2026, impresion en papel satinado de alto contraste en formato coleccionable.',
    variants: [
      { id: 'poster-a3', label: 'A3', price: 65, stock: 20 },
      { id: 'poster-a2', label: 'A2', price: 80, stock: 15 },
      { id: 'poster-signed', label: 'Firmado / A3', price: 120, stock: 5 }
    ],
    image: heroImage,
    link: '#'
  },
  {
    id: 3,
    name: 'Sticker Pack',
    type: 'Accesorio',
    price: 35,
    description:
      'Pack de stickers resistentes al agua con logos y frases de la banda, ideal para guitarra, laptop o case.',
    variants: [
      { id: 'sticker-pack-6', label: 'Pack 6 piezas', price: 35, stock: 30 },
      { id: 'sticker-pack-12', label: 'Pack 12 piezas', price: 60, stock: 18 }
    ],
    image: heroImage,
    link: '#'
  },
  {
    id: 4,
    name: 'Hoodie LITO Nightfall',
    type: 'Sudadera',
    price: 260,
    description:
      'Sudadera pesada con interior afelpado y grafica trasera Nightfall, pensada para shows nocturnos.',
    variants: [
      { id: 'hoodie-m', label: 'Negra / M', price: 260, stock: 9 },
      { id: 'hoodie-l', label: 'Negra / L', price: 270, stock: 7 },
      { id: 'hoodie-xl', label: 'Negra / XL', price: 280, stock: 4 }
    ],
    image: heroImage,
    link: '#'
  },
  {
    id: 5,
    name: 'Gorra Chaos Club',
    type: 'Accesorio',
    price: 120,
    description:
      'Gorra tipo snapback con bordado frontal Chaos Club y visera curva, ajuste comodo para uso diario.',
    variants: [
      { id: 'chaos-black', label: 'Negra', price: 120, stock: 14 },
      { id: 'chaos-bone', label: 'Beige', price: 125, stock: 11 }
    ],
    image: heroImage,
    link: '#'
  },
  {
    id: 6,
    name: 'Bundle Pins + Stickers',
    type: 'Coleccionable',
    price: 85,
    description:
      'Bundle para coleccionistas que incluye pines metalicos y stickers de edicion limitada.',
    variants: [
      { id: 'bundle-standard', label: 'Bundle estandar', price: 85, stock: 16 },
      { id: 'bundle-deluxe', label: 'Bundle deluxe', price: 115, stock: 10 }
    ],
    image: heroImage,
    link: '#'
  }
];

export function getProductById(productId) {
  return getManagedProducts().find((product) => product.id === Number(productId));
}

export function getManagedProducts() {
  return ensureManagedList(PRODUCTS_KEY, products);
}

export function saveManagedProducts(nextProducts) {
  writeManagedList(PRODUCTS_KEY, nextProducts);
}

export const shows = [
  {
    id: 1,
    title: 'Ritmos En Resistencia',
    venue: 'Interfer',
    location: 'Ciudad de Guatemala, Guatemala',
    date: '14 Sep 2026 - 19:30',
    status: 'Confirmado',
    description:
      'Show principal de septiembre con set extendido, invitados y produccion completa de luces.',
    ticketTypes: [
      { id: 'interfer-general', label: 'General', price: 120, stock: 180 },
      { id: 'interfer-vip', label: 'VIP', price: 220, stock: 45 }
    ],
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
    description:
      'Fecha especial en Antigua con opening acts locales y cupo limitado por venue.',
    ticketTypes: [
      { id: 'noise-preventa', label: 'Preventa', price: 95, stock: 120 },
      { id: 'noise-dia', label: 'Dia del evento', price: 130, stock: 90 },
      { id: 'noise-backstage', label: 'Backstage pass', price: 260, stock: 20 }
    ],
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
    description:
      'Presentacion en Xela con repertorio nuevo y meet and greet posterior al show.',
    ticketTypes: [
      { id: 'xela-general', label: 'General', price: 110, stock: 160 },
      { id: 'xela-meet', label: 'Meet & Greet', price: 240, stock: 28 }
    ],
    poster: heroImage,
    link: '#'
  },
  {
    id: 4,
    title: 'Oceanic Breakdown Fest',
    venue: 'Forum Majadas',
    location: 'Ciudad de Guatemala, Guatemala',
    date: '08 Nov 2026 - 20:30',
    status: 'Boletos disponibles',
    description:
      'Festival colaborativo con bandas invitadas y acceso por zonas segun ticket.',
    ticketTypes: [
      { id: 'fest-general', label: 'General', price: 140, stock: 250 },
      { id: 'fest-palco', label: 'Palco', price: 280, stock: 60 },
      { id: 'fest-front', label: 'Front row', price: 340, stock: 35 }
    ],
    poster: heroImage,
    link: '#'
  },
  {
    id: 5,
    title: 'Midnight Tides Session',
    venue: 'El Sotano',
    location: 'Mixco, Guatemala',
    date: '21 Nov 2026 - 19:00',
    status: 'Confirmado',
    description:
      'Sesion intima en formato club, audio inmersivo y merch exclusivo del evento.',
    ticketTypes: [
      { id: 'midnight-general', label: 'General', price: 100, stock: 140 },
      { id: 'midnight-early', label: 'Early Access', price: 170, stock: 35 }
    ],
    poster: heroImage,
    link: '#'
  },
  {
    id: 6,
    title: 'Ruidos del Pacifico',
    venue: 'Marea Negra Club',
    location: 'Escuintla, Guatemala',
    date: '05 Dic 2026 - 21:00',
    status: 'Proximamente',
    description:
      'Cierre de temporada en la costa con visuales nuevas y setlist de aniversario.',
    ticketTypes: [
      { id: 'pacifico-general', label: 'General', price: 115, stock: 170 },
      { id: 'pacifico-vip', label: 'VIP', price: 230, stock: 40 }
    ],
    poster: heroImage,
    link: '#'
  }
];

export function getShowById(showId) {
  return getManagedShows().find((show) => show.id === Number(showId));
}

export function getManagedShows() {
  return ensureManagedList(SHOWS_KEY, shows);
}

export function saveManagedShows(nextShows) {
  writeManagedList(SHOWS_KEY, nextShows);
}

export const posts = [
  {
    id: 1,
    title: 'Nuevo sencillo en produccion',
    excerpt: 'Entramos a estudio para grabar nuestro primer material oficial.',
    date: '02 Ago 2026',
    content: [
      'Esta semana iniciamos sesiones de estudio para trabajar el primer sencillo oficial de Lost In The Ocean, con enfoque en una produccion mas pesada y atmosferica.',
      'El tema mezcla riffs agresivos con melodias nostalgicas, manteniendo la identidad que hemos venido construyendo en vivo durante estos meses.',
      'En los proximos dias compartiremos adelantos del proceso y la fecha estimada de lanzamiento en todas nuestras redes.'
    ],
    image: heroImage,
    link: '#'
  },
  {
    id: 2,
    title: 'Backstage de Interfer',
    excerpt: 'Compartimos fotos y momentos del show en Interfer.',
    date: '11 Jul 2026',
    content: [
      'El show en Interfer nos dejo una noche intensa: venue lleno, setlist completo y una energia que supero todas las expectativas.',
      'Documentamos parte del backstage antes de subir a tarima, incluyendo pruebas de sonido, ajustes finales de instrumentos y momentos del equipo tecnico.',
      'Subimos una galeria con fotos ineditas para que revivas la fecha con nosotros y para agradecer el apoyo de cada persona que llego al evento.'
    ],
    image: heroImage,
    link: '#'
  },
  {
    id: 3,
    title: 'Anuncio de nueva fecha',
    excerpt: 'Nos vemos en Quetzaltenango para cerrar octubre con ruido.',
    date: '22 Jun 2026',
    content: [
      'Confirmamos una nueva fecha en Quetzaltenango para el cierre de octubre, donde vamos a presentar parte del material que viene para la siguiente etapa.',
      'La presentacion sera en Distrito Rock y tendremos cupo limitado, asi que recomendamos comprar tickets con anticipacion.',
      'Pronto vamos a publicar horarios, bandas invitadas y detalles de acceso para que te prepares con tiempo.'
    ],
    image: heroImage,
    link: '#'
  },
  {
    id: 4,
    title: 'Setlist de temporada listo',
    excerpt: 'Publicamos una playlist con la energia de los shows de cierre de ano.',
    date: '13 May 2026',
    content: [
      'Ya definimos el setlist para la temporada de cierre de ano y armamos una playlist que resume la vibra general del tour.',
      'Incluye influencias de post-hardcore, punk y metalcore que inspiran la seleccion de canciones para los siguientes shows.',
      'Si quieres llegar con todo al siguiente concierto, esta playlist es el mejor punto de partida para entrar en ambiente.'
    ],
    image: heroImage,
    link: '#'
  },
  {
    id: 5,
    title: 'Sesion de fotos oficial',
    excerpt: 'Estrenamos nuevas fotos promocionales para la siguiente etapa de la banda.',
    date: '04 Abr 2026',
    content: [
      'Acabamos de terminar una sesion de fotos oficial pensada para representar mejor la estetica de esta nueva fase de la banda.',
      'Trabajamos en locaciones oscuras con contraste alto para capturar la mezcla entre agresividad y melodia que define nuestro sonido.',
      'Estas imagenes se estaran usando en posters, anuncios de fechas y lanzamientos durante los proximos meses.'
    ],
    image: heroImage,
    link: '#'
  },
  {
    id: 6,
    title: 'Cronica del ultimo tour',
    excerpt: 'Un resumen de lo que vivimos en carretera durante las fechas mas recientes.',
    date: '18 Mar 2026',
    content: [
      'El ultimo tramo del tour nos llevo por varias ciudades y cada fecha tuvo su propia historia, desde recintos llenos hasta escenarios nuevos para nosotros.',
      'Entre traslados largos y pruebas de sonido aceleradas, logramos mantener un show solido y una conexion fuerte con cada audiencia.',
      'Gracias por acompanarnos en esta ruta; esta cronica es solo una parte de todo lo que vivimos en carretera.'
    ],
    image: heroImage,
    link: '#'
  }
];

export function getPostById(postId) {
  return getManagedPosts().find((post) => post.id === Number(postId));
}

export function getManagedPosts() {
  return ensureManagedList(POSTS_KEY, posts);
}

export function saveManagedPosts(nextPosts) {
  writeManagedList(POSTS_KEY, nextPosts);
}