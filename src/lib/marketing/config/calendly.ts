export const CALENDLY_DEMO_URL = "https://calendly.com/matertiabtp-demo/30min";

export function calendlyEmbedSrc(month?: string) {
  const params = new URLSearchParams({
    embed: "true",
    hide_gdpr_banner: "1",
  });
  if (month) params.set("month", month);
  return `${CALENDLY_DEMO_URL}?${params.toString()}`;
}

export function calendlyBookingUrl(month?: string) {
  if (!month) return CALENDLY_DEMO_URL;
  return `${CALENDLY_DEMO_URL}?month=${month}`;
}
