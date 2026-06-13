import { expect, test } from "@playwright/test";

test("Base64URL形式で登録URLを受け付ける", async ({ request }) => {
  const url = "https://play.google.com/store/apps/details?id=jp.co.ponos.battlecats&hl=ja";
  const response = await request.get("/api/metadata/link", {
    params: {
      url64: Buffer.from(url).toString("base64url"),
      title: "0",
      image: "0",
    },
  });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    title: "",
    image: "",
  });
});

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
