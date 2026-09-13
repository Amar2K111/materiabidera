import type { ReactNode } from "react";
import { BrandMark, BrandName } from "@/components/brand/BrandLogo";
import { CAPTURE_PROJECT } from "@/lib/marketing/capture-mock-data";

export function CaptureFrame({
  section,
  variant = "dossier",
  children,
}: {
  section: string;
  variant?: "dossier" | "app";
  children: ReactNode;
}) {
  const crumb =
    variant === "app" ? (
      <>
        Application / <b>{section}</b>
      </>
    ) : (
      <>
        Dossiers / <b>{CAPTURE_PROJECT.name}</b> / {section}
      </>
    );

  return (
    <div className="capture-scene mx-auto w-full max-w-[680px] p-4">
      <div className="app-ui__frame overflow-hidden">
        <div className="app-ui__top">
          <div className="app-ui__top-l">
            <span className="app-ui__brand">
              <BrandMark size={14} decorative />
              <BrandName className="text-[13px]" />
            </span>
            <span className="app-ui__crumb">{crumb}</span>
          </div>
        </div>
        <div className="app-ui__content bg-white">{children}</div>
      </div>
    </div>
  );
}
