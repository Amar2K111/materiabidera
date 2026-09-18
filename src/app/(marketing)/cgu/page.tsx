import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: CguPage } = getStaticPage("cgu");
export { metadata };
export default CguPage;
