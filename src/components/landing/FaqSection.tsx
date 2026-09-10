import { FAQ_ITEMS } from "./faq-data";
import { PhotoFallback } from "./PhotoFallback";

function FaqIllustration() {
  return (
    <svg viewBox="0 0 640 800" role="img" aria-labelledby="viz2t">
      <title id="viz2t">
        Mémoire technique relu avant dépôt : passages vérifiés, passage à
        compléter et information manquante signalés en marge.
      </title>
      <rect width="640" height="800" fill="#fff" />
      <rect x="96" y="70" width="448" height="660" rx="8" fill="#fff" stroke="rgba(0,0,0,.18)" />
      <rect x="96" y="70" width="448" height="40" fill="rgba(0,0,0,.045)" />
      <text x="122" y="96" fontFamily="Manrope, sans-serif" fontSize="15" fontWeight="700" fill="rgba(0,0,0,.62)">
        Mémoire technique
      </text>
      <circle cx="118" cy="168" r="6" fill="#0F7A4A" />
      <g fill="rgba(0,0,0,.12)">
        <rect x="142" y="146" width="360" height="9" rx="4.5" />
        <rect x="142" y="172" width="312" height="9" rx="4.5" />
        <rect x="142" y="198" width="344" height="9" rx="4.5" />
      </g>
      <circle cx="118" cy="286" r="6" fill="#0F7A4A" />
      <g fill="rgba(0,0,0,.12)">
        <rect x="142" y="264" width="330" height="9" rx="4.5" />
        <rect x="142" y="290" width="368" height="9" rx="4.5" />
        <rect x="142" y="316" width="268" height="9" rx="4.5" />
      </g>
      <circle cx="118" cy="404" r="6" fill="#A96200" />
      <rect x="134" y="376" width="380" height="72" rx="6" fill="rgba(169,98,0,.07)" />
      <g fill="rgba(169,98,0,.4)">
        <rect x="150" y="394" width="300" height="9" rx="4.5" />
        <rect x="150" y="420" width="232" height="9" rx="4.5" />
      </g>
      <circle cx="118" cy="522" r="6" fill="rgba(0,0,0,.2)" />
      <g fill="rgba(0,0,0,.12)">
        <rect x="142" y="500" width="352" height="9" rx="4.5" />
        <rect x="142" y="526" width="300" height="9" rx="4.5" />
        <rect x="142" y="552" width="330" height="9" rx="4.5" />
      </g>
      <circle cx="118" cy="640" r="6" fill="#B3261E" />
      <rect x="134" y="612" width="380" height="72" rx="6" fill="rgba(179,38,30,.07)" />
      <g fill="rgba(179,38,30,.4)">
        <rect x="150" y="630" width="264" height="9" rx="4.5" />
        <rect x="150" y="656" width="196" height="9" rx="4.5" />
      </g>
    </svg>
  );
}

export function FaqSection() {
  return (
    <section className="sec sec--paper sec--line" id="faq">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">Questions fréquentes</p>
          <h2 className="h2">Les questions qu’on nous pose en premier.</h2>
        </div>

        <div className="faq-split rv">
          <figure className="photo photo-sticky">
            <PhotoFallback
              illustration={<FaqIllustration />}
              sources={[
                {
                  src: "https://images.pexels.com/photos/6476589/pexels-photo-6476589.jpeg?auto=compress&cs=tinysrgb&w=800",
                },
                {
                  src: "https://images.pexels.com/photos/8867432/pexels-photo-8867432.jpeg?auto=compress&cs=tinysrgb&w=800",
                },
              ]}
              alt="Réunion de travail entre professionnels autour d’un dossier avant la remise de l’offre"
            />
          </figure>

          <div className="faq" id="faq-list">
            {FAQ_ITEMS.map((item) => (
              <div className="faq-i" key={item.q}>
                <h3>
                  <button type="button" className="faq-q" aria-expanded="false">
                    {item.q}
                    <span className="faq-ic" aria-hidden="true" />
                  </button>
                </h3>
                <div className="faq-a">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
