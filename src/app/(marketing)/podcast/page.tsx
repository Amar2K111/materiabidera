import { getStaticPage } from "@/lib/marketing/content/static-page";

const { metadata, render: PodcastPage } = getStaticPage("podcast");
export { metadata };
export default PodcastPage;
