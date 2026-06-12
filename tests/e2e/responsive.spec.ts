import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile-320", width: 320, height: 568 },
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "landscape-mobile", width: 812, height: 375 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop-boundary", width: 1024, height: 768 },
  { name: "desktop-1366", width: 1366, height: 768 },
  { name: "fhd", width: 1920, height: 1080 },
  { name: "qhd", width: 2560, height: 1440 },
] as const;

const MAIN_ROUTES = [
  "/",
  "/about",
  "/works",
  "/interests",
  "/articles",
  "/achievement",
] as const;

async function blockMedia(page: Page) {
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "media") {
      await route.abort();
      return;
    }
    await route.continue();
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

for (const viewport of VIEWPORTS) {
  test(`トップページが ${viewport.name} で横にはみ出さない`, async ({
    page,
  }) => {
    await blockMedia(page);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByTestId("home-hero")).toBeVisible();
    await expectNoHorizontalOverflow(page);

    if (viewport.height <= 500 && viewport.width < 1024) {
      await expect(page.locator(".global-scroll-indicator")).toBeHidden();
    }
  });
}

for (const viewport of [
  VIEWPORTS[0],
  VIEWPORTS[4],
  VIEWPORTS[5],
  VIEWPORTS[8],
]) {
  test(`主要ページが ${viewport.name} で横にはみ出さない`, async ({ page }) => {
    await blockMedia(page);
    await page.setViewportSize(viewport);

    for (const route of MAIN_ROUTES) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });
}

test("モバイルドロワーを操作でき、フォーカスとスクロールを管理する", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/about");

  const menuButton = page.getByRole("button", {
    name: "ナビゲーションメニューを開く",
  });
  await menuButton.click();

  const drawer = page.getByRole("dialog", { name: "サイトナビゲーション" });
  await expect(drawer).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.body.style.overflow === "hidden" &&
          document.documentElement.style.overflow === "hidden",
      ),
    )
    .toBe(true);

  for (const label of [
    "TOP",
    "ABOUT",
    "WORKS",
    "INTERESTS",
    "ARTICLES",
    "OTOGE",
    "ACHIEVEMENT",
  ]) {
    await expect(drawer.getByText(label, { exact: true })).toBeVisible();
  }

  for (const label of [
    "X",
    "GitHub",
    "Unityroom",
    "AtCoder",
    "Qiita",
    "Zenn",
  ]) {
    const socialLink = drawer.getByRole("link", { name: label });
    await expect(socialLink).toBeVisible();
    await expect(socialLink).not.toContainText(label);
  }

  const drawerCloseButton = drawer.getByRole("button", {
    name: "ナビゲーションメニューを閉じる",
  });
  await expect(drawerCloseButton).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(drawer.getByRole("link", { name: "Zenn" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(drawerCloseButton).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(menuButton).toBeFocused();

  await menuButton.click();
  await page
    .getByRole("button", { name: "ナビゲーションメニューを閉じる" })
    .first()
    .click({ position: { x: 10, y: 300 } });
  await expect(drawer).toBeHidden();

  await menuButton.click();
  await drawer.getByRole("link", { name: "WORKS", exact: true }).click();
  await expect(page).toHaveURL(/\/works$/);
  await expect(drawer).toBeHidden();
  await expect(
    page.getByRole("button", { name: "ナビゲーションメニューを開く" }),
  ).toBeVisible();
});

test("1024px未満は全面オーバーレイ、以上は斜めパネルになる", async ({
  page,
}) => {
  await blockMedia(page);
  const overlay = page.getByTestId("home-hero-overlay");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(overlay).toBeVisible();
  const mobileStyle = await overlay.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      clipPath: style.clipPath,
      width: element.getBoundingClientRect().width,
    };
  });
  expect(mobileStyle.clipPath).toBe("none");
  expect(mobileStyle.width).toBeGreaterThanOrEqual(389);

  await page.setViewportSize({ width: 1024, height: 768 });
  const desktopStyle = await overlay.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      clipPath: style.clipPath,
      width: element.getBoundingClientRect().width,
    };
  });
  expect(desktopStyle.clipPath).toContain("polygon");
  expect(desktopStyle.width).toBeLessThan(1024);
});

test("カルーセルカード幅がモバイルで判読可能かつQHDで上限内", async ({
  page,
}) => {
  await blockMedia(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");

  const firstWorkSlide = page
    .getByTestId("works-carousel")
    .locator(".slick-slide")
    .first();
  await expect(firstWorkSlide).toBeVisible();
  const mobileWidth = await firstWorkSlide.evaluate(
    (element) => element.getBoundingClientRect().width,
  );
  expect(mobileWidth).toBeGreaterThanOrEqual(280);
  expect(mobileWidth).toBeLessThanOrEqual(320);

  await page.setViewportSize({ width: 2560, height: 1440 });
  const qhdWidth = await firstWorkSlide.evaluate(
    (element) => element.getBoundingClientRect().width,
  );
  expect(qhdWidth).toBeLessThanOrEqual(896);
});

test("ヒーロー動画は最大2要素で同一ソースを重複マウントしない", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  const videos = page.locator("video[data-hero-source]");
  await expect.poll(() => videos.count()).toBeGreaterThan(0);

  const sources = await videos.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("data-hero-source") ?? ""),
  );
  expect(sources.length).toBeLessThanOrEqual(2);
  expect(new Set(sources).size).toBe(sources.length);
});

test("作品モーダルと記事フィルターをモバイルで操作できる", async ({
  page,
}) => {
  await blockMedia(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/works");

  const firstWorkCard = page.locator("main button").filter({
    has: page.locator("h3"),
  }).first();
  await firstWorkCard.click();
  const closeButton = page.getByRole("button", { name: "詳細モーダルを閉じる" });
  await expect(closeButton).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await closeButton.click();
  await expect(closeButton).toBeHidden();

  await page.goto("/articles");
  const filterButton = page.getByRole("button", { name: "Qiita" });
  await filterButton.click();
  await expect(filterButton).toHaveCSS("min-height", "44px");

  const rssLink = page.getByRole("link", { name: "RSS購読" });
  const rssBox = await rssLink.boundingBox();
  expect(rssBox?.width).toBeGreaterThanOrEqual(44);
  expect(rssBox?.height).toBeGreaterThanOrEqual(44);
  await expectNoHorizontalOverflow(page);
});
