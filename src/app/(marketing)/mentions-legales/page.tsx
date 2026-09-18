import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: MentionsPage } = getStaticPage("mentions-legales");
export { metadata };
export default MentionsPage;
