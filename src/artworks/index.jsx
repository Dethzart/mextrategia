import GenommaLab from './GenommaLab';
import Cinepolis  from './Cinepolis';
import Cinemex    from './Cinemex';
import Telmex     from './Telmex';
import Inbursa    from './Inbursa';

const ARTWORKS = {
  'genommalab.ai': () => <GenommaLab />,
  'cinepolis.ai':  () => <Cinepolis />,
  'cinemex.ai':    () => <Cinemex />,
  'telmex.ai':     () => <Telmex />,
  'inbursa.ai':    () => <Inbursa />,
};

export function getArtwork(hostname) {
  return ARTWORKS[hostname] ?? null;
}
