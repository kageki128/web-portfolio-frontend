import AboutPage from "@/components/site/pages/AboutPage";
import { getAboutOverview } from "@/server/about/overview";

export const revalidate = 1800;

export default async function Page() {
  const overview = await getAboutOverview();
  return <AboutPage overview={overview} />;
}
