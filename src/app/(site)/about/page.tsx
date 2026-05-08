import AboutPage from "@/components/site/pages/AboutPage";
import { getAboutActivities } from "@/server/about/activities";
import { getAboutOverview } from "@/server/about/overview";

export const revalidate = 1800;

export default async function Page() {
  const [overview, activities] = await Promise.all([getAboutOverview(), getAboutActivities()]);
  return <AboutPage overview={overview} activities={activities} />;
}
