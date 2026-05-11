import WorksPage from "@/components/site/pages/WorksPage";
import { getAllWorks } from "@/server/works/all";

export default async function Page() {
  const works = await getAllWorks();
  return <WorksPage featuredWorks={works.featuredWorks} allWorksByYear={works.allWorksByYear} />;
}
