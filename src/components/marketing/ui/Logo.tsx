type LogoProps = {
  className?: string;
};

export function Logo({ className = "h-[26px] w-auto" }: LogoProps) {
  return (
    <img
      src="/logo-materia.png"
      alt="MateriaBTP"
      width={210}
      height={26}
      className={className}
    />
  );
}

export function LogoMark({ className = "h-[15px] w-[15px] shrink-0 object-cover object-left" }: { className?: string }) {
  return (
    <img
      src="/logo-materia.png"
      alt=""
      aria-hidden="true"
      width={15}
      height={15}
      className={className}
    />
  );
}
