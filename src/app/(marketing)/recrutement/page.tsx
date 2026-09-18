import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: RecrutementPage } = getStaticPage("recrutement");
export { metadata };
export default RecrutementPage;
