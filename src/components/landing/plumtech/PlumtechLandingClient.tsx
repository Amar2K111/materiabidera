"use client";

import Script from "next/script";

/** Calendly + modale demo (comportement de materia-calendly-modal.js). */
export function PlumtechLandingClient() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://assets.calendly.com/assets/external/widget.css"
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
      <Script
        src="/materiabtp-assets/materia-calendly-modal.js?v=4"
        strategy="afterInteractive"
      />
    </>
  );
}
