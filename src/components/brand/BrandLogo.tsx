import Image from "next/image";

const LOGO_WIDTH = 878;
const LOGO_HEIGHT = 150;
const ICON_WIDTH = 1024;
const ICON_HEIGHT = 682;

type BrandLogoProps = {
  height?: number;
  className?: string;
  priority?: boolean;
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
}: BrandLogoProps) {
  const width = Math.round((height * LOGO_WIDTH) / LOGO_HEIGHT);

  return (
    <Image
      src="/images/materiabtp-logo.png"
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
  const width = Math.round((size * ICON_WIDTH) / ICON_HEIGHT);

  return (
    <Image
      src="/images/materiabtp-icon.png"
      alt={decorative ? "" : "MateriaBTP"}
      width={width}
      height={size}
      className={className}
      priority={priority}
      aria-hidden={decorative}
      style={{ width: "auto", height: size }}
    />
  );
}

/** Nom de marque en texte (Materia + BTP). */
export function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-extrabold tracking-[-0.06em] ${className}`}>
      <span className="text-[#001845]">Materia</span>
      <span className="text-brand">BTP</span>
    </span>
  );
}
