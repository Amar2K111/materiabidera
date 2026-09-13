const ALT =
  "Capture MateriaBTP : tableau de bord avec dossiers appels d'offres BTP en cours";

const SRC = "/images/hero/dashboard-fr.png";
const SRCSET = [
  "/images/hero/_r/dashboard-fr-480.png 480w",
  "/images/hero/_r/dashboard-fr-640.png 640w",
  "/images/hero/_r/dashboard-fr-960.png 960w",
  "/images/hero/_r/dashboard-fr-1440.png 1440w",
  "/images/hero/dashboard-fr.png 1440w",
].join(", ");

function HeroWindowMockup({
  className,
  sizes,
}: {
  className: string;
  sizes: string;
}) {
  return (
    <div className={className}>
      <div className="hero-banner-media__stage">
        <div className="hero-banner-media__frame">
          <div className="hero-banner-media__chrome" aria-hidden="true">
            <div className="hero-banner-media__dots">
              <span />
              <span />
              <span />
            </div>
            <div className="hero-banner-media__url">materiabtp.info</div>
          </div>
          <div className="hero-banner-media__viewport">
            <picture>
              <img
                className="hero-banner-media__img"
                src={SRC}
                srcSet={SRCSET}
                sizes={sizes}
                alt={ALT}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Visuel hero : capture dashboard centrée dans une fenêtre app inclinée.
 */
export function HeroVisual() {
  return (
    <div
      className="hero-visual rv"
      aria-label="Interface MateriaBTP — tableau de bord dossiers appels d'offres BTP"
    >
      <div className="hero-visual-col hidden sm:block min-w-0">
        <HeroWindowMockup
          className="hero-banner-media"
          sizes="(min-width: 640px) 48vw, 1px"
        />
      </div>
      <HeroWindowMockup
        className="hero-banner-media hero-banner-media--mobile w-full sm:hidden"
        sizes="100vw"
      />
    </div>
  );
}
