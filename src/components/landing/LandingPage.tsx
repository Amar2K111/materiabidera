import { ChecklistExportStep } from "./steps/ChecklistExportStep";
import { CompanyBaseStep } from "./steps/CompanyBaseStep";
import { DceAnalysisStep } from "./steps/DceAnalysisStep";
import { GoNoGoStep } from "./steps/GoNoGoStep";
import { MemoryStep } from "./steps/MemoryStep";
import { QualityStep } from "./steps/QualityStep";
import { RequirementsStep } from "./steps/RequirementsStep";
import { StrategyStep } from "./steps/StrategyStep";
import { FinalCtaSection } from "./FinalCtaSection";
import { FaqSection } from "./FaqSection";
import { Hero } from "./Hero";
import { LandingClient } from "./LandingClient";
import { LandingFooter } from "./LandingFooter";
import { Navbar } from "./Navbar";
import { NotChatbotSection } from "./NotChatbotSection";
import { ProblemSection } from "./ProblemSection";
import { SecuritySection } from "./SecuritySection";
import { SpecializationSection } from "./SpecializationSection";
import { ValueSection } from "./ValueSection";
import { WorkflowSection } from "./WorkflowSection";

export function LandingPage() {
  return (
    <>
      <LandingClient />
      <Navbar secondaryHref="/login" secondaryLabel="Se connecter" />
      <main>
        <Hero />
        <ProblemSection />
        <WorkflowSection />
        <DceAnalysisStep />
        <GoNoGoStep />
        <RequirementsStep />
        <CompanyBaseStep />
        <StrategyStep />
        <MemoryStep />
        <QualityStep />
        <ChecklistExportStep />
        <NotChatbotSection />
        <SpecializationSection />
        <ValueSection />
        <SecuritySection />
        <FinalCtaSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </>
  );
}
