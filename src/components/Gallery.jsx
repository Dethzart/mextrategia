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
    title:    '—',
    artist:   '—',
    domain:   'cinepolis.ai',
    year:     '—',
    lot:      'LOT-CNP-001',
    status:   'pendiente',
    isReal:   false,
    description: 'Obra en desarrollo.',
    medium: '—',
  },
  {
    id:       'cinemex',
    title:    '—',
    artist:   '—',
    domain:   'cinemex.ai',
    year:     '—',
    lot:      'LOT-CMX-001',
    status:   'pendiente',
    isReal:   false,
    description: 'Obra en desarrollo.',
    medium: '—',
  },
  {
    id:       'telmex',
    title:    '—',
    artist:   '—',
    domain:   'telmex.ai',
    year:     '—',
    lot:      'LOT-TLX-001',
    status:   'pendiente',
    isReal:   false,
    description: 'Obra en desarrollo.',
    medium: '—',
  },
  {
    id:       'inbursa',
    title:    '—',
    artist:   '—',
    domain:   'inbursa.ai',
    year:     '—',
    lot:      'LOT-INB-001',
    status:   'pendiente',
    isReal:   false,
    description: 'Obra en desarrollo.',
    medium: '—',
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
          Dominios digitales apropiados como territorio est&eacute;tico.<br />
          Lotes certificados en blockchain como actas del fracaso corporativo.
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
