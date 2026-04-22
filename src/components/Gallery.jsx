const artworks = [
  {
    id:       'genommalab',
    title:    'Genoma de la Inercia',
    artist:   'MextrategIA',
    domain:   'genommalab.ai',
    year:     '2025',
    lot:      'LOT-GNM-001',
    status:   'activo',
    isReal:   true,
    description:
      'Secuencia generativa extraída de los registros bursátiles de Genomma Lab ' +
      'desde su pico de capitalización en 2013. Cada nodo representa un trimestre ' +
      'de deterioro acumulado. La secuencia nunca completa la hélice. ' +
      'El dominio genommalab.ai —apropiado como gesto artístico— permanece activo ' +
      'como archivo del tiempo perdido y del fracaso estratégico ante la transición digital.',
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
    isReal:   true,
    description:
      'Visualización generativa del aforo de Cinépolis desde el colapso pandémico ' +
      'de 2020 hasta la recuperación parcial de 2025. Cada butaca es un dato ' +
      'trimestral de asistencia. La sala nunca vuelve a llenarse: el 88% es ' +
      'el nuevo techo.',
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
    isReal:   true,
    description:
      'Cada punto de luz es una sala Cinemex que existió. Desde el pico de 356 ' +
      'ubicaciones en 2019, la quiebra de 2021 inició una extinción silenciosa: ' +
      'más de 130 puntos se apagaron para siempre.',
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
    isReal:   true,
    description:
      'Cinco ondas de señal representan la red de líneas fijas de Telmex desde su ' +
      'pico de 19.8 millones en 2008. Conforme las líneas disminuyen, la señal se ' +
      'corrompe: el ruido reemplaza la frecuencia, los segmentos colapsan en silencio estático.',
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
    isReal:   true,
    description:
      '280 partículas orbitan un núcleo de gravedad financiera que crece con la ' +
      'utilidad neta de Inbursa: de $4.2B en 2010 a $30.1B en 2025. La atracción ' +
      'aumenta cada año, acercando el capital al centro.',
    medium: 'Intervención de dominio digital / Net-art especulativo',
  },
];

function GalleryVisual({ work, index }) {
  if (work.isReal) {
    return (
      <div className="gallery-visual gallery-visual--real">
        <div className="gallery-visual-domain">{work.domain}</div>
        <div className="gallery-visual-label">Intervención activa</div>
      </div>
    );
  }
  return (
    <div className="gallery-visual gallery-visual--placeholder">
      <span className="gallery-visual-num">0{index + 1}</span>
    </div>
  );
}

export default function Gallery() {
  return (
    <div className="gallery">
      <div className="gallery-header">
        <div className="gallery-eyebrow">Galería de Obras</div>
        <h1 className="gallery-title">Intervenciones</h1>
        <p className="gallery-subtitle">
          Cada dominio intervenido es una galer&iacute;a.
        </p>
      </div>

      <div className="gallery-grid">
        {artworks.map((work, i) => (
          <div className={`gallery-card${work.isReal ? ' gallery-card--real' : ' gallery-card--placeholder'}`} key={work.id}>
            <GalleryVisual work={work} index={i} />

            <div className="gallery-card-body">
              <a href={`https://${work.domain}`} target="_blank" rel="noopener noreferrer" className="gallery-card-domain-link">
                <div className="gallery-card-domain">{work.domain}</div>
              </a>

              {work.isReal ? (
                <>
                  <div className="gallery-card-title">{work.title}</div>
                  <div className="gallery-card-artist">{work.artist}, {work.year}</div>
                  <p className="gallery-card-desc">{work.description}</p>
                  <div className="gallery-card-medium">{work.medium}</div>
                </>
              ) : (
                <div className="gallery-card-pending">Obra pendiente de desarrollo</div>
              )}
            </div>

            <div className="gallery-card-footer">
              <span className="gallery-card-lot">{work.lot}</span>
              <span className={`gallery-card-status gallery-card-status--${work.status}`}>
                {work.status}
              </span>
              <a
                href={`https://${work.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`gallery-visit-btn${!work.isReal ? ' gallery-visit-btn--pending' : ''}`}
              >
                VISITAR
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
