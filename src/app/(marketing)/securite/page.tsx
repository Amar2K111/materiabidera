import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: SecuritePage } = getStaticPage("securite");
export { metadata };
export default SecuritePage;
