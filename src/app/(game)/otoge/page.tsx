import Link from "next/link";

export default function Page() {
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <Link
        href="/"
        className="absolute left-4 top-4 z-10 rounded-md border border-(--otoge-white) bg-(--otoge-black) px-3 py-1.5 text-xs font-bold tracking-wider text-(--otoge-white) transition-colors hover:bg-(--otoge-white) hover:text-(--otoge-black)"
      >
        TOP
      </Link>
      <main className="h-full w-full p-4 pt-14">
        <div className="grid h-full w-full place-items-center">
          <div className="aspect-video h-full w-auto max-h-full max-w-full rounded-xl border border-(--otoge-white) bg-(--otoge-black)" />
        </div>
      </main>
    </div>
  );
}
