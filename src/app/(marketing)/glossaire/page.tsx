import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: GlossairePage } = getStaticPage("glossaire");
export { metadata };
export default GlossairePage;
