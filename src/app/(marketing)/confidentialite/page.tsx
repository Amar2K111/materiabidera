import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: ConfidentialitePage } = getStaticPage("confidentialite");
export { metadata };
export default ConfidentialitePage;
