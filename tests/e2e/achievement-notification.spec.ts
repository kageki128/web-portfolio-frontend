import { expect, test, type Page } from "@playwright/test";

const HAPPY_SECRET_COMMAND_DIRECTIONS = [
  "right",
  "down",
  "up",
  "right",
  "right",
  "down",
  "right",
  "right",
  "up",
  "up",
  "down",
  "down",
  "left",
  "right",
  "left",
  "right",
] as const;

async function prepareEmptyAchievementProgress(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "web-portfolio-achievements:v1",
      JSON.stringify({
        unlockedIds: [],
        viewedWorkIds: [],
        readArticleIds: [],
      }),
    );
  });
}

test("長い実績名は省略せず通知カード内に収める", async ({ page }) => {
  await prepareEmptyAchievementProgress(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");

  const title = page.getByTestId("achievement-notification-title");
  await expect(title).toHaveText("幸せになれる隠しコマンドがあるらしい");
  await expect
    .poll(() =>
      title.evaluate((element) => ({
        fits: element.scrollWidth <= element.clientWidth,
        fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
      })),
    )
    .toEqual({
      fits: true,
      fontSize: expect.any(Number),
    });
  await expect
    .poll(() =>
      title.evaluate(
        (element) => Number.parseFloat(getComputedStyle(element).fontSize) < 18,
      ),
    )
    .toBe(true);
});

test("モバイルのフリック入力で隠しコマンドを達成できる", async ({ page }) => {
  await prepareEmptyAchievementProgress(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  for (const direction of HAPPY_SECRET_COMMAND_DIRECTIONS) {
    const wasNotPrevented = await page.evaluate((flickDirection) => {
      const target = document.body;
      const start = { x: 180, y: 400 };
      const distance = 80;
      const end = {
        x:
          start.x +
          (flickDirection === "right" ? distance : flickDirection === "left" ? -distance : 0),
        y:
          start.y +
          (flickDirection === "down" ? distance : flickDirection === "up" ? -distance : 0),
      };
      const createTouch = (identifier: number, x: number, y: number) => ({
        identifier,
        clientX: x,
        clientY: y,
      });
      const createTouchEvent = (
        type: string,
        touches: ReturnType<typeof createTouch>[],
        changedTouches: ReturnType<typeof createTouch>[],
      ) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperties(event, {
          touches: { value: touches },
          changedTouches: { value: changedTouches },
        });
        return event;
      };
      const startTouch = createTouch(1, start.x, start.y);
      const endTouch = createTouch(1, end.x, end.y);
      const touchStartWasNotPrevented = target.dispatchEvent(
        createTouchEvent("touchstart", [startTouch], [startTouch]),
      );
      const touchEndWasNotPrevented = target.dispatchEvent(
        createTouchEvent("touchend", [], [endTouch]),
      );

      return touchStartWasNotPrevented && touchEndWasNotPrevented;
    }, direction);

    expect(wasNotPrevented).toBe(true);
  }

  await expect(page.getByTestId("achievement-notification-title")).toHaveText(
    "幸せになれる隠しコマンドがあるらしい",
  );
});
