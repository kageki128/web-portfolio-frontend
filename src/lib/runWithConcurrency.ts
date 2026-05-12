export async function runWithConcurrency<T>(
  values: readonly T[],
  maxConcurrency: number,
  run: (value: T, index: number) => Promise<void>,
): Promise<void> {
  if (values.length === 0) return;

  const workerCount = Math.max(1, Math.min(maxConcurrency, values.length));
  let nextIndex = 0;

  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      if (currentIndex >= values.length) {
        return;
      }

      await run(values[currentIndex] as T, currentIndex).catch(() => {
        // 1件の失敗で全体を止めず、取れた素材から順次反映する。
      });
    }
  });

  await Promise.all(workers);
}
