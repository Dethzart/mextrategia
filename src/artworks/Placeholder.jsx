import ArtworkShell from './ArtworkShell';

export default function Placeholder({ corpId, domain, lot }) {
  return (
    <ArtworkShell corpId={corpId} domain={domain}>
      <div className="artwork-placeholder">
        <div className="artwork-placeholder-lot">{lot}</div>
        <div className="artwork-placeholder-domain">{domain}</div>
        <div className="artwork-placeholder-label">Obra en desarrollo</div>
        <a
          className="artwork-placeholder-link"
          href="https://mextrategia.art"
          target="_blank"
          rel="noopener noreferrer"
        >
          mextrategia.art
        </a>
      </div>
    </ArtworkShell>
  );
}
