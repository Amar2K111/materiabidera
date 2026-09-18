import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: ContactPage } = getStaticPage("contact");
export { metadata };
export default ContactPage;
