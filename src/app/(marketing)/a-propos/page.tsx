import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: AboutPage } = getStaticPage("a-propos");
export { metadata };
export default AboutPage;
