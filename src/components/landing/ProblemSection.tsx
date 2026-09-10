import { PhotoFallback } from "./PhotoFallback";

/**
 * Illustration de pieces de DCE empilees (RC, CCTP, CCAP), avec une exigence
 * et un point de vigilance reperes. Sert de fond permanent derriere la photo,
 * et de repli final si aucune photo ne charge (section "Pas de fausses
 * promesses" : jamais de cadre vide).
 */
function StackedDocumentsIllustration() {
  return (
    <svg viewBox="0 0 800 1000" role="img" aria-labelledby="landing-viz1-title">
      <title id="landing-viz1-title">
        Pièces d’un dossier de consultation empilées : CCAP, CCTP et
        règlement de consultation, dont une page où une exigence et un point
        de vigilance sont repérés.
      </title>
      <rect width="800" height="1000" fill="#fff" />
      <g transform="rotate(-7 400 520)">
        <rect x="192" y="188" width="416" height="580" rx="6" fill="#fff" stroke="rgba(0,0,0,.14)" />
        <rect x="192" y="188" width="416" height="34" fill="rgba(0,0,0,.04)" />
        <text x="216" y="211" fontFamily="Manrope, sans-serif" fontSize="15" fontWeight="700" fill="rgba(0,0,0,.42)">
          CCAP
        </text>
        <g fill="rgba(0,0,0,.10)">
          <rect x="216" y="268" width="300" height="9" rx="4.5" />
          <rect x="216" y="296" width="352" height="9" rx="4.5" />
          <rect x="216" y="324" width="268" height="9" rx="4.5" />
          <rect x="216" y="368" width="336" height="9" rx="4.5" />
          <rect x="216" y="396" width="216" height="9" rx="4.5" />
        </g>
      </g>
      <g transform="rotate(4 400 520)">
        <rect x="178" y="206" width="428" height="596" rx="6" fill="#fff" stroke="rgba(0,0,0,.16)" />
        <rect x="178" y="206" width="428" height="34" fill="rgba(0,0,0,.04)" />
        <text x="202" y="229" fontFamily="Manrope, sans-serif" fontSize="15" fontWeight="700" fill="rgba(0,0,0,.42)">
          CCTP
        </text>
        <g fill="rgba(0,0,0,.10)">
          <rect x="202" y="286" width="356" height="9" rx="4.5" />
          <rect x="202" y="314" width="300" height="9" rx="4.5" />
          <rect x="202" y="342" width="380" height="9" rx="4.5" />
          <rect x="202" y="386" width="264" height="9" rx="4.5" />
          <rect x="202" y="414" width="344" height="9" rx="4.5" />
          <rect x="202" y="442" width="292" height="9" rx="4.5" />
        </g>
      </g>
      <g transform="rotate(-1.5 400 540)">
        <rect x="150" y="230" width="452" height="612" rx="8" fill="#fff" stroke="rgba(0,0,0,.2)" />
        <rect x="150" y="230" width="452" height="40" fill="rgba(0,0,0,.045)" />
        <text x="176" y="256" fontFamily="Manrope, sans-serif" fontSize="16" fontWeight="700" fill="rgba(0,0,0,.62)">
          Règlement de consultation
        </text>
        <g fill="rgba(0,0,0,.12)">
          <rect x="176" y="312" width="392" height="10" rx="5" />
          <rect x="176" y="342" width="330" height="10" rx="5" />
          <rect x="176" y="372" width="368" height="10" rx="5" />
        </g>
        <rect x="164" y="410" width="424" height="58" rx="6" fill="rgba(0,53,169,.07)" />
        <rect x="164" y="410" width="3" height="58" fill="#0035A9" />
        <rect x="188" y="428" width="300" height="10" rx="5" fill="rgba(0,53,169,.5)" />
        <rect x="188" y="448" width="188" height="8" rx="4" fill="rgba(0,53,169,.3)" />
        <g fill="rgba(0,0,0,.12)">
          <rect x="176" y="500" width="352" height="10" rx="5" />
          <rect x="176" y="530" width="404" height="10" rx="5" />
          <rect x="176" y="560" width="286" height="10" rx="5" />
        </g>
        <rect x="164" y="598" width="424" height="58" rx="6" fill="rgba(169,98,0,.07)" />
        <rect x="164" y="598" width="3" height="58" fill="#A96200" />
        <rect x="188" y="616" width="268" height="10" rx="5" fill="rgba(169,98,0,.45)" />
        <rect x="188" y="636" width="212" height="8" rx="4" fill="rgba(169,98,0,.28)" />
        <g fill="rgba(0,0,0,.12)">
          <rect x="176" y="688" width="372" height="10" rx="5" />
          <rect x="176" y="718" width="318" height="10" rx="5" />
          <rect x="176" y="748" width="396" height="10" rx="5" />
          <rect x="176" y="778" width="240" height="10" rx="5" />
        </g>
        <text x="176" y="822" fontFamily="Manrope, sans-serif" fontSize="13" fontWeight="700" fill="rgba(0,0,0,.3)">
          page 12 sur 487
        </text>
      </g>
    </svg>
  );
}

const CARDS = [
  {
    n: "01",
    title: "Les exigences sont dispersées",
    text: "Les informations qui comptent sont réparties entre le RC, le CCTP, le CCAP, les annexes et les autres pièces. Rien ne signale celle que vous n’avez pas encore lue.",
  },
  {
    n: "02",
    title: "Chaque réponse recommence trop souvent de zéro",
    text: "Votre entreprise possède déjà des références, des méthodes, des certifications, des CV et un savoir-faire. Ils restent difficiles à retrouver au moment où il faudrait s’en servir.",
  },
  {
    n: "03",
    title: "Un mémoire peut être bien écrit sans répondre au vrai besoin",
    text: "Le problème n’est pas seulement la rédaction. La note se joue sur la correspondance entre votre réponse et les critères de jugement du marché.",
  },
  {
    n: "04",
    title: "Une exigence oubliée peut fragiliser toute la réponse",
    text: "Un élément manquant, partiel ou non vérifié pèse plus lourd que la qualité du reste. BIDERA les fait remonter avant la remise.",
  },
] as const;

export function ProblemSection() {
  return (
    <section className="sec" id="produit">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">Le point de départ</p>
          <h2 className="h2">
            Répondre à un appel d’offres ne devrait pas commencer par 300
            pages de PDF.
          </h2>
          <p className="lede">
            Le temps ne se perd pas à la rédaction. Il se perd avant : à
            chercher, recouper et vérifier ce que le dossier demande
            vraiment.
          </p>
        </div>

        <div className="prob">
          <figure className="photo photo-sticky rv">
            <PhotoFallback
              illustration={<StackedDocumentsIllustration />}
              sources={[
                {
                  src: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1000",
                },
                {
                  src: "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1000",
                },
              ]}
              alt="Équipe d’une entreprise BTP réunie autour de la préparation d’une réponse à un appel d’offres"
            />
          </figure>

          <div className="grid g2 rv-group">
            {CARDS.map((c) => (
              <article className="card rv-item" key={c.n}>
                <p className="card-n">{c.n}</p>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
