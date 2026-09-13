import Image from "next/image";

const WORDMARK_WIDTH = 302;
const WORDMARK_HEIGHT = 52;
const ICON_SIZE = 48;

const LOGO_SRC = {
  default: "/materiabtp-assets/images/logo-materiabtp-wordmark.png",
  onDark: "/materiabtp-assets/images/logo-materiabtp-wordmark-light.png",
  icon: "/materiabtp-assets/images/logo-materiabtp-icon.png",
} as const;

type BrandLogoProps = {
  height?: number;
  className?: string;
  priority?: boolean;
  /** Logo blanc / bleu clair pour header et footer sombres */
  variant?: "default" | "on-dark";
};

type BrandMarkProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  /** false quand l'icone accompagne deja le nom visible */
  decorative?: boolean;
};

/** Logo MateriaBTP complet (navbar, footer, pages auth). */
export function BrandLogo({
  height = 28,
  className,
  priority = false,
  variant = "default",
}: BrandLogoProps) {
  const width = Math.round((height * WORDMARK_WIDTH) / WORDMARK_HEIGHT);

  return (
    <Image
      src={variant === "on-dark" ? LOGO_SRC.onDark : LOGO_SRC.default}
      alt="MateriaBTP"
      width={width}
      height={height}
      className={className}
      priority={priority}
      style={{ width: "auto", height }}
    />
  );
}

/** Pictogramme MateriaBTP (favicon, header compact, mockups). */
export function BrandMark({
  size = 24,
  className,
  priority = false,
  decorative = false,
}: BrandMarkProps) {
  return (
    <Image
      src={LOGO_SRC.icon}
      width={size}
      height={size}
      alt={decorative ? "" : "MateriaBTP"}
      className={className}
      priority={priority}
      aria-hidden={decorative}
      style={{ width: size, height: size }}
    />
  );
}

/** Nom de marque en texte (Materia + BTP). */
export function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-extrabold tracking-[-0.06em] ${className}`}>
      <span className="text-ink">Materia</span>
      <span className="text-brand">BTP</span>
    </span>
  );
}
