import {
  PLUMTECH_BODY_HTML,
  PLUMTECH_INLINE_STYLE,
  PLUMTECH_MODAL_HTML,
} from "./landing-markup";
import { PlumtechCompareSection } from "./PlumtechCompareSection";
import { PlumtechDemoSection } from "./PlumtechDemoSection";
import { PlumtechFaqController } from "./PlumtechFaqController";
import { PlumtechFooter } from "./PlumtechFooter";
import { PlumtechHowItWorks } from "./PlumtechHowItWorks";
import { PlumtechRoiSection } from "./PlumtechRoiSection";
import { PlumtechLandingClient } from "./PlumtechLandingClient";
import { splitLandingHtml } from "./split-landing-html";
import "./plumtech-landing.css";
import "./plumtech-sections.css";

/** Landing MateriaBTP (ex index.html Plumtech / Tenderbolt layout). */
export function PlumtechLanding() {
  const parts = splitLandingHtml(PLUMTECH_BODY_HTML);

  return (
    <>
      <PlumtechLandingClient />
      {PLUMTECH_INLINE_STYLE ? (
        <style dangerouslySetInnerHTML={{ __html: PLUMTECH_INLINE_STYLE }} />
      ) : null}
      <div className="plumtech-landing">
        <div dangerouslySetInnerHTML={{ __html: parts.beforeFeatures }} />
        <PlumtechDemoSection />
        <div dangerouslySetInnerHTML={{ __html: parts.features }} />
        <PlumtechHowItWorks />
        <div dangerouslySetInnerHTML={{ __html: parts.trust }} />
        <PlumtechRoiSection />
        <div dangerouslySetInnerHTML={{ __html: parts.middleBeforeFaq }} />
        <PlumtechCompareSection />
        <div dangerouslySetInnerHTML={{ __html: parts.faqCta }} />
      </div>
      <PlumtechFaqController />
      <PlumtechFooter />
      <div dangerouslySetInnerHTML={{ __html: PLUMTECH_MODAL_HTML }} />
    </>
  );
}
