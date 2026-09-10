export const CALENDLY_DEMO_URL =
  "https://calendly.com/matertiabtp-demo/30min?month=2026-09&hide_gdpr_banner=1&primary_color=0035a9";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

/** Ouvre le popup Calendly de demo, avec repli nouvel onglet si le widget n'est pas charge. */
export function openCalendlyDemo(e?: { preventDefault?: () => void }) {
  e?.preventDefault?.();
  if (window.Calendly?.initPopupWidget) {
    window.Calendly.initPopupWidget({ url: CALENDLY_DEMO_URL });
  } else {
    window.open(CALENDLY_DEMO_URL, "_blank", "noopener,noreferrer");
  }
}
