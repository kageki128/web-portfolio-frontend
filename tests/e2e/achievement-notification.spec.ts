import { expect, test } from "@playwright/test";

test("長い実績名は省略せず通知カード内に収める", async ({ page }) => {
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
