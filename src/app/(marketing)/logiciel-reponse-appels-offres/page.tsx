import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: LogicielPage } = getStaticPage("logiciel-reponse-appels-offres");
export { metadata };
export default LogicielPage;
