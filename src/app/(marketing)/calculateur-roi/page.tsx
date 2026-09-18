import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: RoiPage } = getStaticPage("calculateur-roi");
export { metadata };
export default RoiPage;
