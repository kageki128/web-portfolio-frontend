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
  await expect(menuButton).toHaveCSS("cursor", "pointer");
  await expect(menuButton).toHaveCSS("border-top-width", "0px");
  await expect(menuButton).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
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
    "ACHIEVE",
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
  await expect(drawerCloseButton).toHaveCSS("cursor", "pointer");
  await expect(
    drawer.getByRole("link", { name: "WORKS", exact: true }),
  ).toHaveCSS("cursor", "pointer");
  const otogeLink = drawer.getByRole("link", { name: "OTOGE" });
  const achieveLink = drawer.getByRole("link", { name: "ACHIEVE" });
  await expect(otogeLink).toHaveCSS("cursor", "pointer");
  await expect(achieveLink).toHaveCSS("cursor", "pointer");
  const [otogeStyle, achieveStyle] = await Promise.all(
    [otogeLink, achieveLink].map((link) =>
      link.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          color: style.color,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth,
        };
      }),
    ),
  );
  expect(otogeStyle).toEqual(achieveStyle);
  await expect(drawer.getByRole("link", { name: "GitHub" })).toHaveCSS(
    "cursor",
    "pointer",
  );
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

test("モバイルドロワーを開いたまま画面を広げるとスクロールロックを解除する", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/about");

  const menuButton = page.getByRole("button", {
    name: "ナビゲーションメニューを開く",
  });
  const drawer = page.getByRole("dialog", { name: "サイトナビゲーション" });

  await menuButton.click();
  await expect(drawer).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.body.style.overflow === "hidden" &&
          document.documentElement.style.overflow === "hidden",
      ),
    )
    .toBe(true);

  await page.setViewportSize({ width: 1024, height: 768 });

  await expect(drawer).toBeHidden();
  await expect(
    page.locator('button[aria-label="ナビゲーションメニューを開く"]'),
  ).toHaveAttribute("aria-expanded", "false");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.body.style.overflow !== "hidden" &&
          document.documentElement.style.overflow !== "hidden",
      ),
    )
    .toBe(true);

  await page.evaluate(() => window.scrollTo(0, 300));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
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
  const modalTitle = page.locator("h2", { hasText: "Senirenol Bloom" });
  const modalAction = page.getByRole("button", { name: "NO LINK" });
  const [titleBox, actionBox] = await Promise.all([
    modalTitle.boundingBox(),
    modalAction.boundingBox(),
  ]);
  expect(titleBox).not.toBeNull();
  expect(actionBox).not.toBeNull();
  expect(Math.abs((titleBox?.y ?? 0) - (actionBox?.y ?? 0))).toBeLessThanOrEqual(1);
  await expectNoHorizontalOverflow(page);
  await closeButton.click();
  await expect(closeButton).toBeHidden();

  await page.goto("/articles");
  const filterButton = page.getByRole("button", { name: "Qiita" });
  await filterButton.click();
  await expect(filterButton).toHaveCSS("min-height", "44px");
  await expect(
    page.locator('a[href^="https://qiita.com/"][href*="/items/"]').first(),
  ).toBeVisible();

  const rssLink = page.getByRole("link", { name: "RSS購読" });
  const rssBox = await rssLink.boundingBox();
  expect(rssBox?.width).toBeGreaterThanOrEqual(44);
  expect(rssBox?.height).toBeGreaterThanOrEqual(44);
  await expectNoHorizontalOverflow(page);
});

test("ページ見出しの英語と日本語の大きさの比率が一定になる", async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1366, height: 768 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/achievement");

    const backgroundTitle = page.getByTestId("section-title-background");
    const foregroundTitle = page.getByTestId("section-title-foreground");
    await expect(backgroundTitle).toHaveText("ACHIEVE");
    await expect(foregroundTitle).toHaveText("実績");
    await expect(backgroundTitle).toHaveCSS("transform", "none");
    await expect
      .poll(async () => {
        const backgroundFontSize = Number.parseFloat(
          await backgroundTitle.evaluate(
            (element) => getComputedStyle(element).fontSize,
          ),
        );
        const foregroundFontSize = Number.parseFloat(
          await foregroundTitle.evaluate(
            (element) => getComputedStyle(element).fontSize,
          ),
        );
        return foregroundFontSize / backgroundFontSize;
      })
      .toBeCloseTo(1 / 3, 2);
  }
});

test("モバイルでは日本語見出しの大きさを優先する", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/achievement");

  const backgroundTitle = page.getByTestId("section-title-background");
  const foregroundTitle = page.getByTestId("section-title-foreground");
  await expect
    .poll(() =>
      foregroundTitle.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      ),
    )
    .toBeGreaterThanOrEqual(23.9);
  await expect
    .poll(() =>
      backgroundTitle.evaluate(
        (element) => element.scrollWidth > element.clientWidth,
      ),
    )
    .toBe(true);
  await expectNoHorizontalOverflow(page);
});

test("AboutのTech Stackは狭幅でも空き幅に応じて横並びになる", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");

  const grid = page.getByTestId("tech-stack-grid");
  await expect(grid).toBeVisible();
  await expect
    .poll(() =>
      grid.evaluate((element) => {
        return getComputedStyle(element).gridTemplateColumns.split(" ").length;
      }),
    )
    .toBeGreaterThanOrEqual(2);
  await expectNoHorizontalOverflow(page);
});

test("実績の完了表示が狭幅に収まり、最終実績がトロフィー色になる", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "web-portfolio-achievements:v1",
      JSON.stringify({
        unlockedIds: [
          "first_visit",
          "about_bottom",
          "work_1",
          "work_5",
          "interests_bottom",
          "article_1",
          "article_5",
          "otoge_link",
          "happy_secret_command",
          "all_complete",
        ],
        viewedWorkIds: [],
        readArticleIds: [],
      }),
    );
  });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/achievement");

  const completionSummary = page.getByTestId("achievement-completion-summary");
  const completionLabel = page.getByTestId("achievement-completion-label");
  await expect(completionSummary).toBeVisible();
  await expect
    .poll(() =>
      completionLabel.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= document.documentElement.clientWidth;
      }),
    )
    .toBe(true);
  await expectNoHorizontalOverflow(page);

  const trophy = page.getByTestId("achievement-completion-trophy").locator("svg");
  const completionCard = page.getByTestId("achievement-card-all_complete");
  const completionIcon = page.getByTestId("achievement-icon-all_complete");
  const regularCard = page.getByTestId("achievement-card-first_visit");
  const colors = await Promise.all(
    [trophy, completionIcon, completionCard, regularCard].map((locator) =>
      locator.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
        };
      }),
    ),
  );

  expect(colors[1].color).toBe(colors[0].color);
  expect(colors[2].backgroundColor).not.toBe(colors[3].backgroundColor);
});

test("Blobは中央に召喚され、現在のポインターへすぐ移動する", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "web-portfolio-achievements:v1",
      JSON.stringify({
        unlockedIds: [
          "first_visit",
          "about_bottom",
          "work_1",
          "work_5",
          "interests_bottom",
          "article_1",
          "article_5",
          "otoge_link",
          "happy_secret_command",
          "all_complete",
        ],
        viewedWorkIds: [],
        readArticleIds: [],
      }),
    );
  });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/achievement");

  const summonToggle = page.getByRole("checkbox", { name: "Blobを呼ぶ" });
  await expect(summonToggle).toBeVisible();
  await page.getByText("SUMMON BLOB", { exact: true }).click();
  await expect(summonToggle).toBeChecked();

  const blob = page.getByTestId("blob-follower");
  await expect(blob).toBeVisible();
  const initialPosition = await blob.evaluate((element) => {
    const { left, top, width, height } = element.getBoundingClientRect();
    return {
      centerX: left + width / 2,
      centerY: top + height / 2,
    };
  });
  expect(Math.abs(initialPosition.centerX - 512)).toBeLessThan(24);
  expect(Math.abs(initialPosition.centerY - 384)).toBeLessThan(24);
  await expect(page.getByTestId("blob-moving-image")).toHaveCSS("opacity", "1");
  await expect(page.getByTestId("blob-idle-image")).toHaveCSS("opacity", "0");
});
