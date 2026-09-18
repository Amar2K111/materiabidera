import { HeroSection } from "@/components/marketing/HeroSection";
import { LogosMarquee } from "@/components/marketing/LogosMarquee";
import { DemoExpress } from "@/components/marketing/DemoExpress";
import { ProductSections } from "@/components/marketing/ProductSections";
import { StatsSection } from "@/components/marketing/StatsSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { AgentsSection } from "@/components/marketing/AgentsSection";
import { ComparisonSection } from "@/components/marketing/ComparisonSection";
import { SectorsSection } from "@/components/marketing/SectorsSection";
import { SecuritySection } from "@/components/marketing/SecuritySection";
import { BlogSection } from "@/components/marketing/BlogSection";
import { GlossaryStrip } from "@/components/marketing/GlossaryStrip";
import { ResourcesSection } from "@/components/marketing/ResourcesSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { CtaSection } from "@/components/marketing/CtaSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <LogosMarquee />
      <DemoExpress />
      <ProductSections />
      <StatsSection />
      <TestimonialsSection />
      <HowItWorksSection />
      <AgentsSection />
      <ComparisonSection />
      <SectorsSection />
      <SecuritySection />
      <BlogSection />
      <GlossaryStrip />
      <ResourcesSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
