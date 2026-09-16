const FEATURES_MARKER = "Une plateforme unique";
const TRUST_MARKER = "Vos \u00e9quipes sont talentueuses";
const STATS_MARKER = "Les chiffres parlent";
const FAQ_MARKER = "Questions fr\u00e9quentes.";

function sectionStart(html: string, markerIndex: number) {
  const start = html.lastIndexOf("<section", markerIndex);
  return start >= 0 ? start : markerIndex;
}

export function splitLandingHtml(html: string) {
  const featuresIndex = html.indexOf(FEATURES_MARKER);
  const trustIndex = html.indexOf(TRUST_MARKER);
  const faqIndex = html.indexOf(FAQ_MARKER);

  if (featuresIndex < 0 || trustIndex < 0 || faqIndex < 0) {
    return {
      beforeFeatures: html,
      features: "",
      trust: "",
      middleBeforeFaq: "",
      faqCta: "",
    };
  }

  const featuresStart = sectionStart(html, featuresIndex);
  const trustStart = sectionStart(html, trustIndex);
  const faqStart = sectionStart(html, faqIndex);

  const statsIndex = html.indexOf(STATS_MARKER);
  let trustHtml = html.slice(trustStart, faqStart);
  let middleBeforeFaq = "";

  if (statsIndex > trustStart && statsIndex < faqStart) {
    const statsStart = sectionStart(html, statsIndex);
    const statsEnd = html.indexOf("</section>", statsIndex) + 10;
    trustHtml = html.slice(trustStart, statsStart);
    middleBeforeFaq = html.slice(statsEnd, faqStart);
  }

  return {
    beforeFeatures: html.slice(0, featuresStart),
    features: html.slice(featuresStart, trustStart),
    trust: trustHtml,
    middleBeforeFaq,
    faqCta: html.slice(faqStart),
  };
}
