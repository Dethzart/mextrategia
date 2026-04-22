import {
  ThumbGenommaLab, ThumbCinepolis, ThumbCinemex, ThumbTelmex, ThumbInbursa,
} from '../artworks/thumbnails';

const artworks = [
  {
    id:       'genommalab',
    title:    'Genoma de la Inercia',
    artist:   'MextrategIA',
    domain:   'genommalab.ai',
    year:     '2025',
    lot:      'LOT-GNM-001',
    status:   'activo',
    description:
      'Secuencia generativa extraída de los registros bursátiles de Genomma Lab ' +
      'desde su pico de capitalización en 2013. Cada nodo representa un trimestre ' +
      'de deterioro acumulado. La secuencia nunca completa la hélice.',
    medium: 'Intervención de dominio digital / Net-art especulativo',
  },
  {
    id:       'cinepolis',
    title:    'Algoritmo de la Butaca',
    artist:   'MextrategIA',
    domain:   'cinepolis.ai',
    year:     '2025',
    lot:      'LOT-CNP-001',
    status:   'activo',
    description:
      'Visualización generativa del aforo de Cinépolis desde el colapso pandémico ' +
      'de 2020 hasta la recuperación parcial de 2025. La sala nunca vuelve a llenarse: ' +
      'el 88% es el nuevo techo.',
    medium: 'Intervención de dominio digital / Net-art especulativo',
  },
  {
    id:       'cinemex',
    title:    'Extinción por Franquicia',
    artist:   'MextrategIA',
    domain:   'cinemex.ai',
    year:     '2025',
    lot:      'LOT-CMX-001',
    status:   'activo',
    description:
      'Cada punto de luz es una sala Cinemex. La quiebra de 2021 inició una extinción ' +
      'silenciosa: más de 130 puntos se apagaron para siempre.',
    medium: 'Intervención de dominio digital / Net-art especulativo',
  },
  {
    id:       'telmex',
    title:    'Señal Degradada',
    artist:   'MextrategIA',
    domain:   'telmex.ai',
    year:     '2025',
    lot:      'LOT-TLX-001',
    status:   'activo',
    description:
      'Ondas de señal que se corrompen conforme caen las líneas fijas de Telmex ' +
      'desde su pico de 19.8 millones en 2008. El ruido reemplaza la frecuencia.',
    medium: 'Intervención de dominio digital / Net-art especulativo',
  },
  {
    id:       'inbursa',
    title:    'Rendimiento Concentrado',
    artist:   'MextrategIA',
    domain:   'inbursa.ai',
    year:     '2025',
    lot:      'LOT-INB-001',
    status:   'activo',
    description:
      '280 partículas orbitan un núcleo de gravedad financiera que crece con la ' +
      'utilidad neta de Inbursa: de $4.2B en 2010 a $30.1B en 2025.',
    medium: 'Intervención de dominio digital / Net-art especulativo',
  },
];

const THUMBS = {
  genommalab: ThumbGenommaLab,
  cinepolis:  ThumbCinepolis,
  cinemex:    ThumbCinemex,
  telmex:     ThumbTelmex,
  inbursa:    ThumbInbursa,
};

function GalleryVisual({ work }) {
  const Thumb = THUMBS[work.id];
  return (
    <a
      href={`https://${work.domain}`}
      target="_blank"
      rel="noopener noreferrer"
      className="gallery-visual"
    >
      <div className="gallery-thumb-canvas">
        {Thumb ? <Thumb /> : null}
      </div>
      <div className="gallery-visual-overlay">
        <span className="gallery-visual-visit">VISITAR →</span>
      </div>
    </a>
  );
}

export default function Gallery() {
  return (
    <div className="gallery">
      <div className="gallery-header">
        <div className="gallery-eyebrow">Galería de Obras</div>
        <h1 className="gallery-title">Intervenciones</h1>
        <p className="gallery-subtitle">
          Cada dominio intervenido es una obra activa.
        </p>
      </div>

      <div className="gallery-grid">
        {artworks.map((work) => (
          <div className="gallery-card" key={work.id}>
            <GalleryVisual work={work} />

            <div className="gallery-card-body">
              <div className="gallery-card-header">
                <span className="gallery-card-lot">{work.lot}</span>
                <span className="gallery-card-status">activo</span>
              </div>
              <a
                href={`https://${work.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gallery-card-domain-link"
              >
                {work.domain}
              </a>
              <div className="gallery-card-title">{work.title}</div>
              <div className="gallery-card-artist">{work.artist} — {work.year}</div>
              <p className="gallery-card-desc">{work.description}</p>
              <div className="gallery-card-medium">{work.medium}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
