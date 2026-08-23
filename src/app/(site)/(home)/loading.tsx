import { HomeLoadingScreen } from "@/components/site/pages/home/HomeLoadingScreen";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[10000]">
      <HomeLoadingScreen paused />
    </div>
  );
}
