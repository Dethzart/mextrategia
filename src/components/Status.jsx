import { corporations } from '../data/corporations';

export default function Status() {
  return (
    <div className="status-page">

      {/* ── Header ── */}
      <div className="status-header">
        <div className="status-eyebrow">Estado del Proyecto &mdash; V1</div>
        <h1 className="status-title">
          MextrategIA:<br />
          <em>C&oacute;mo funciona</em>
        </h1>
        <div className="status-meta">
          mextrategia.art &mdash; Net-Art / Cr&iacute;tica Financiera &mdash; 2025
        </div>
      </div>

      {/* ── Qué es ── */}
      <section className="status-section">
        <div className="status-section-label">01 &mdash; Concepto</div>
        <h2 className="status-section-title">Qu&eacute; es MextrategIA</h2>
        <p>
          MextrategIA es un dispositivo de net-art que adquiri&oacute; los dominios <strong>.ai</strong> de
          los grandes corporativos mexicanos que han evadido la transformaci&oacute;n digital y la
          modernizaci&oacute;n &eacute;tica. Cada dominio es una intervenci&oacute;n: el equivalente digital de
          pintar un mural sobre la fachada de una empresa.
        </p>
        <p>
          La diferencia es ontol&oacute;gica. El mural puede borrarse con pintura; el activo digital
          tiene un precio que asciende cada segundo. <strong>La intervenci&oacute;n deviene irreversible.</strong>
        </p>
        <p>
          Los cinco dominios intervenidos son: <span className="status-domain">genommalab.ai</span>,{' '}
          <span className="status-domain">cinepolis.ai</span>,{' '}
          <span className="status-domain">cinemex.ai</span>,{' '}
          <span className="status-domain">telmex.ai</span>,{' '}
          <span className="status-domain">inbursa.ai</span>.
        </p>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="status-section">
        <div className="status-section-label">02 &mdash; Sistema</div>
        <h2 className="status-section-title">C&oacute;mo funciona el sistema</h2>
        <p>
          El sitio opera como una obra en tiempo real. Desde el momento en que el proyecto fue
          lanzado, un reloj interno acumula el precio de cada dominio segundo a segundo.
          No hay pausa. No hay descuento. No hay negociaci&oacute;n.
        </p>
        <p>
          El p&uacute;blico no es espectador: es co-autor del precio. A trav&eacute;s de tres mecanismos de
          participaci&oacute;n &mdash;votos, comentarios y likes&mdash; cada persona influye directamente
          en la velocidad a la que crece el valor de cada dominio.
        </p>

        <div className="status-mechanisms">
          <div className="status-mechanism">
            <div className="status-mechanism-label">Voto</div>
            <div className="status-mechanism-desc">
              Un voto por persona, a un solo dominio. Permanente. Incrementa V en la f&oacute;rmula,
              lo que eleva directamente el factor F<sub>i</sub>. El voto puede cambiarse (se
              retira del anterior y se aplica al nuevo) pero nunca se pueden tener dos activos.
            </div>
          </div>
          <div className="status-mechanism">
            <div className="status-mechanism-label">Comentario</div>
            <div className="status-mechanism-desc">
              Un comentario por persona en total, sobre cualquier dominio. Se elige si es
              negativo o positivo. Los negativos incrementan S; los positivos lo reducen.
              Ambos afectan el precio: negativos lo suben, positivos lo bajan.
            </div>
          </div>
          <div className="status-mechanism">
            <div className="status-mechanism-label">Like</div>
            <div className="status-mechanism-desc">
              Un like por persona en total, a cualquier comentario. Permanente. Los likes en
              comentarios negativos incrementan S levemente; los likes en positivos lo reducen.
              El impacto de un like es menor que el de un comentario directo.
            </div>
          </div>
        </div>

        <p className="status-note">
          Toda participaci&oacute;n requiere verificaci&oacute;n humana (desaf&iacute;o matem&aacute;tico) y se
          persiste en el dispositivo del usuario. Una vez emitidos, votos, comentarios y likes
          son permanentes y no se pueden revocar (excepto el voto, que puede redirigirse).
        </p>
      </section>

      {/* ── La Fórmula ── */}
      <section className="status-section">
        <div className="status-section-label">03 &mdash; F&oacute;rmula</div>
        <h2 className="status-section-title">La F&oacute;rmula de Castigo Global</h2>
        <p>
          El precio de cada dominio no responde a la oferta y la demanda. Responde a variables
          que miden el da&ntilde;o acumulado. &Eacute;sta es la f&oacute;rmula central de la obra:
        </p>

        <div className="status-formula-block">
          P<sub>t</sub> = &Sigma;( 0.01 &times; CAP<sub>Act</sub>/CAP<sub>M&aacute;x</sub> &times; F<sub>factor</sub> &times; F<sub>i</sub> )
        </div>
        <div className="status-formula-sub">
          F<sub>i</sub> = V &times; S &nbsp;&nbsp;|&nbsp;&nbsp;
          S = clamp(0.1, 1, S<sub>base</sub> + neg&times;0.02 + L⁻&times;0.003 &minus; pos&times;0.015 &minus; L⁺&times;0.002)
        </div>

        <div className="status-vars">

          <div className="status-var">
            <div className="status-var-name">0.01 MXN/seg &mdash; Tasa base</div>
            <div className="status-var-body">
              El reloj de la obra. Por cada segundo que transcurre desde el lanzamiento del
              proyecto, el precio acumula 0.01 pesos. Es la m&eacute;trica de la inercia corporativa:
              el costo literal del tiempo perdido, contabilizado segundo a segundo sin pausa.
            </div>
          </div>

          <div className="status-var">
            <div className="status-var-name">CAP<sub>Act</sub> / CAP<sub>M&aacute;x</sub> &mdash; Deterioro burs&aacute;til</div>
            <div className="status-var-body">
              Raz&oacute;n entre la capitalizaci&oacute;n burs&aacute;til actual de la empresa y su m&aacute;ximo hist&oacute;rico.
              Telmex tiene un ratio de 0.29: vale hoy el 29% de lo que lleg&oacute; a valer.
              Este factor modula la tasa base seg&uacute;n la posici&oacute;n financiera relativa de cada corporativo.
            </div>
            <div className="status-var-table">
              {corporations.map(c => (
                <div className="status-var-row" key={c.id}>
                  <span>{c.domain}</span>
                  <span>CAP {(c.capRatio * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="status-var">
            <div className="status-var-name">F<sub>factor</sub> &mdash; Factor &eacute;tico</div>
            <div className="status-var-body">
              Amplificador derivado de las calificaciones de empleados en Indeed y Glassdoor.
              A peores calificaciones, mayor factor de castigo. Telmex lidera con 3.8 porque
              sus empleados le dan las peores notas (Indeed 2.1, Glassdoor 2.0). La l&oacute;gica
              es deliberadamente invertida: las empresas m&aacute;s da&ntilde;inas acumulan precio m&aacute;s r&aacute;pido.
            </div>
            <div className="status-var-table">
              {[...corporations].sort((a,b) => b.ethicsFactor - a.ethicsFactor).map(c => (
                <div className="status-var-row" key={c.id}>
                  <span>{c.domain}</span>
                  <span>F = {c.ethicsFactor} &nbsp;&middot;&nbsp; Indeed {c.reviews.indeed} &nbsp;&middot;&nbsp; Glassdoor {c.reviews.glassdoor}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="status-var">
            <div className="status-var-name">F<sub>i</sub> = V &times; S &mdash; Participaci&oacute;n p&uacute;blica</div>
            <div className="status-var-body">
              El &uacute;nico factor que el p&uacute;blico controla directamente. Es el producto de dos variables:
            </div>
          </div>

          <div className="status-var status-var--indented">
            <div className="status-var-name">V &mdash; Votos</div>
            <div className="status-var-body">
              <code>V = (votosBase + votoUsuario) / 1000</code><br /><br />
              Los votos base son hist&oacute;ricos y est&aacute;n incorporados al sistema. Cada voto ciudadano
              a&ntilde;ade 1 a V para ese corporativo, incrementando F<sub>i</sub> y por tanto la tasa
              de crecimiento del precio. Impacto: +1/1000 a V, multiplicado por S, F<sub>factor</sub> y CAP.
            </div>
          </div>

          <div className="status-var status-var--indented">
            <div className="status-var-name">S &mdash; Sentimiento (din&aacute;mico)</div>
            <div className="status-var-body">
              S no es un valor fijo: se recalcula en tiempo real desde los comentarios p&uacute;blicos
              y sus likes. Parte de un valor base por empresa y crece o decrece seg&uacute;n el engagement.
              <br /><br />
              <strong>Solo cuentan votos negativos:</strong><br />
              Comentario negativo: +0.02 a S<br />
              Like en comentario negativo: +0.003 a S<br />
              Comentario positivo: &minus;0.015 a S<br />
              Like en comentario positivo: &minus;0.002 a S<br />
              <br />
              S tiene piso de 0.1 (la deuda nunca desaparece) y techo de 1.0.
              <br /><br />
              <strong>Jerarqu&iacute;a de impacto:</strong><br />
              Voto directo &gt; Comentario negativo &gt; Like en negativo &gt; Comentario positivo (baja) &gt; Like en positivo (baja)
            </div>
          </div>
        </div>
      </section>

      {/* ── Estado V1 ── */}
      <section className="status-section">
        <div className="status-section-label">04 &mdash; V1</div>
        <h2 className="status-section-title">Estado actual del proyecto</h2>

        <div className="status-items">
          <div className="status-item status-item--done">
            <span className="status-item-mark">✓</span>
            <div>
              <div className="status-item-title">Dominios adquiridos</div>
              <div className="status-item-desc">genommalab.ai, cinepolis.ai, cinemex.ai, telmex.ai, inbursa.ai, mextrategia.art</div>
            </div>
          </div>
          <div className="status-item status-item--done">
            <span className="status-item-mark">✓</span>
            <div>
              <div className="status-item-title">Dashboard en tiempo real</div>
              <div className="status-item-desc">Precios, rankings, votos y análisis de sentimiento actualizados cada 100ms</div>
            </div>
          </div>
          <div className="status-item status-item--done">
            <span className="status-item-mark">✓</span>
            <div>
              <div className="status-item-title">Sistema de participación pública</div>
              <div className="status-item-desc">Votación, comentarios y likes con verificación humana y persistencia permanente</div>
            </div>
          </div>
          <div className="status-item status-item--done">
            <span className="status-item-mark">✓</span>
            <div>
              <div className="status-item-title">Primera obra: Genomma Lab</div>
              <div className="status-item-desc">genommalab.ai activo como primera intervención documentada de la serie</div>
            </div>
          </div>
          <div className="status-item status-item--pending">
            <span className="status-item-mark">○</span>
            <div>
              <div className="status-item-title">Backend global de participación</div>
              <div className="status-item-desc">Votos y comentarios actualmente locales por dispositivo. V2 tendrá base de datos compartida</div>
            </div>
          </div>
          <div className="status-item status-item--pending">
            <span className="status-item-mark">○</span>
            <div>
              <div className="status-item-title">Galería de obras completa</div>
              <div className="status-item-desc">4 obras pendientes de desarrollo (cinepolis.ai, cinemex.ai, telmex.ai, inbursa.ai)</div>
            </div>
          </div>
          <div className="status-item status-item--pending">
            <span className="status-item-mark">○</span>
            <div>
              <div className="status-item-title">Lotes digitales en blockchain</div>
              <div className="status-item-desc">Certificación de intervenciones como tokens en cadena. Pendiente de implementación</div>
            </div>
          </div>
          <div className="status-item status-item--pending">
            <span className="status-item-mark">○</span>
            <div>
              <div className="status-item-title">Datos bursátiles en tiempo real</div>
              <div className="status-item-desc">CAP ratio actualmente estático. V2 conectará API financiera para datos en vivo</div>
            </div>
          </div>
        </div>
      </section>

      <div className="status-signature">
        MextrategIA &mdash; mextrategia.art &mdash; 2025<br />
        Net-Art / Cr&iacute;tica Financiera / Arte Especulativo
      </div>

    </div>
  );
}
