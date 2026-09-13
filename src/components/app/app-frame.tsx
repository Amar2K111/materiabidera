import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function AppFrame({
  crumb,
  right,
  foot,
  children,
}: {
  crumb: ReactNode;
  right?: ReactNode;
  foot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="app-ui__frame">
      <div className="app-ui__top">
        <div className="app-ui__top-l">
          <Link href="/app" className="app-ui__brand" aria-label="Retour au tableau de bord">
            <BrandLogo height={22} />
          </Link>
          <span className="app-ui__crumb">{crumb}</span>
        </div>
        {right ? <div className="app-ui__top-r">{right}</div> : null}
      </div>
      {children}
      {foot ? <div className="app-ui__foot">{foot}</div> : null}
    </div>
  );
}
