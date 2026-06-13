---
title: "Markdownテスト"
date: "2026-05-05"
---

![](/images/blog/test.webp)

Markdownテスト  
末尾スペースによる改行テスト

# H1 見出しテスト

## H2 見出しテスト

### H3 見出しテスト

#### H4 見出しテスト

##### H5 見出しテスト

###### H6 見出しテスト

---

通常テキスト、**太字**、*強調*、~~取り消し線~~、`inline code`

> 引用ブロック
> 2行目

:::info
情報メッセージ
:::

:::warning
警告メッセージ
:::

:::error
エラーメッセージ
:::

:::success
成功メッセージ
:::

## リスト

- 箇条書きA
- 箇条書きB
- 箇条書きC

1. 番号付きリスト1
2. 番号付きリスト2
3. 番号付きリスト3

- [x] タスクリスト完了
- [ ] タスクリスト未完了

## リンク

- 内部リンク: [Aboutページ](/about)
- 外部リンク: [Next.js公式](https://nextjs.org/)

## コード

```ts
type User = {
  id: string;
  name: string;
};

const user: User = { id: "u1", name: "Kageki" };
console.log(user.name);
```

```bash
npm run dev
```

## 表

| 項目 | 値 | メモ |
| --- | --- | --- |
| 見出し | h1-h6 | 全レベル確認 |
| 文字装飾 | strong/em/del/code | インライン確認 |
| GFM | table/task list | 表示確認 |
| リンク | internal/external | 遷移確認 |
