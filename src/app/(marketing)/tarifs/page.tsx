import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: TarifsPage } = getStaticPage("tarifs");
export { metadata };
export default TarifsPage;
