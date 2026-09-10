"use client";

import { DemoModal } from "./DemoModal";
import { FaqController } from "./FaqController";
import { RevealController } from "./RevealController";

/** Interactivite landing : modale demo, reveals au scroll, accordeon FAQ. */
export function LandingClient() {
  return (
    <>
      <DemoModal />
      <RevealController />
      <FaqController />
    </>
  );
}
