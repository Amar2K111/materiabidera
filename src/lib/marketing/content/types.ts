export type FaqItem = { q: string; a: string };

export type CardItem = {
  title: string;
  description: string;
  href?: string;
};

export type ModulePage = {
  slug: string;
  title: string;
  description: string;
  eyebrow?: string;
  intro: string;
  benefits?: CardItem[];
  features?: string[];
  challenges?: string[];
  how?: CardItem[];
  faq?: FaqItem[];
};

export type ResourcePage = {
  slug: string;
  title: string;
  description: string;
  format: "Excel" | "Word" | "PDF";
  intro: string;
  highlights: string[];
  cta: string;
};

export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: string;
  excerpt: string;
  body: string[];
};

export type GlossaryEntry = {
  term: string;
  definition: string;
};

export type StaticPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow?: string;
  sections: StaticSection[];
};

export type StaticSection =
  | { type: "prose"; content: string[] }
  | { type: "cards"; title?: string; items: CardItem[] }
  | { type: "pricing"; plans: PricingPlan[] }
  | { type: "form"; form: "demo" | "contact" }
  | { type: "glossary"; entries: GlossaryEntry[] }
  | { type: "roi-calculator" }
  | { type: "case-studies"; items: CaseStudy[] }
  | { type: "team"; members: TeamMember[] }
  | { type: "jobs"; items: JobOpening[] }
  | { type: "podcast"; episodes: PodcastEpisode[] }
  | { type: "security"; items: CardItem[] };

export type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export type CaseStudy = {
  company: string;
  quote: string;
  author: string;
  role: string;
  stat: string;
  statLabel: string;
};

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
};

export type JobOpening = {
  title: string;
  location: string;
  type: string;
  description: string;
};

export type PodcastEpisode = {
  title: string;
  guest: string;
  date: string;
  description: string;
};
