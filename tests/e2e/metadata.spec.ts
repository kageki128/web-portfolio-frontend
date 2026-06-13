import { expect, test } from "@playwright/test";

test("未登録URLのメタデータ取得を拒否する", async ({ request }) => {
  const response = await request.get("/api/metadata/link", {
    params: {
      url: "http://127.0.0.1:8787/",
    },
  });

  expect(response.status()).toBe(403);
  expect(await response.json()).toEqual({
    title: "",
    image: "",
  });
});
