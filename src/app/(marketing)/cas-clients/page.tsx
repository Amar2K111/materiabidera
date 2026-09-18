import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: CasClientsPage } = getStaticPage("cas-clients");
export { metadata };
export default CasClientsPage;
