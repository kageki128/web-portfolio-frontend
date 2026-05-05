import WorksPage from "@/components/site/pages/WorksPage";
import { getAllWorks } from "@/server/works/all";

export const revalidate = 1800;

export default async function Page() {
  const works = await getAllWorks();
  return <WorksPage featuredWorks={works.featuredWorks} allWorksByYear={works.allWorksByYear} />;
}
