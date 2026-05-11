import InterestsPage from "@/components/site/pages/InterestsPage";
import { getAllInterests } from "@/server/interests/all";

export default async function Page() {
  const interests = await getAllInterests();
  return <InterestsPage interests={interests} />;
}
