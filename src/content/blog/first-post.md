---
title: "Markdown機能の総合テスト記事"
date: "2026-05-05"
---

![](/images/blog/first-post.jpg)

この記事は、Blogページで利用できるMarkdown機能をまとめて確認するためのテストです。  
2行目は末尾スペースによる改行テストです。

# H1 見出しテスト

## H2 見出しテスト

### H3 見出しテスト

#### H4 見出しテスト

##### H5 見出しテスト

###### H6 見出しテスト

---

通常テキストに **太字**、*強調*、~~取り消し線~~、`inline code` を混ぜた表示テストです。

> これは引用ブロックです。  
> 2行目も含めて表示されるか確認します。

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

## 画像（2枚目）

![サブ画像](/images/blog/first-post.jpg "same image for caption test")

最終段落です。本文の余白、行間、段落間スペースの見え方もこの段落で確認します。
