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
  | { type: "security"; items: CardItem[] };

export type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};
