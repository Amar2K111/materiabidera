import { CALENDLY_DEMO_URL } from "@/lib/calendly";

/** Bouton/lien CTA demo — ouverture geree par DemoModal via .btn-calendly */
export function CalendlyDemoLink({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a className={`${className} btn-calendly`} href={CALENDLY_DEMO_URL}>
      {children}
    </a>
  );
}
