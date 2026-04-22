import GenommaLab from './GenommaLab';
import Placeholder from './Placeholder';

const ARTWORKS = {
  'genommalab.ai':  () => <GenommaLab />,
  'cinepolis.ai':   () => <Placeholder corpId="cinepolis" domain="cinepolis.ai"  lot="LOT-CNP-001" />,
  'cinemex.ai':     () => <Placeholder corpId="cinemex"   domain="cinemex.ai"   lot="LOT-CMX-001" />,
  'telmex.ai':      () => <Placeholder corpId="telmex"    domain="telmex.ai"    lot="LOT-TLX-001" />,
  'inbursa.ai':     () => <Placeholder corpId="inbursa"   domain="inbursa.ai"   lot="LOT-INB-001" />,
};

export function getArtwork(hostname) {
  return ARTWORKS[hostname] ?? null;
}
