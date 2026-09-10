import Image from "next/image";

const LOGO_WIDTH = 878;
const LOGO_HEIGHT = 150;

type BrandLogoProps = {
  height?: number;
  className?: string;
  priority?: boolean;
};

/** Logo MateriaBTP (image officielle). */
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

/** Nom de marque en texte (Materia + BTP). */
export function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-extrabold tracking-[-0.06em] ${className}`}>
      <span className="text-[#001845]">Materia</span>
      <span className="text-brand">BTP</span>
    </span>
  );
}
