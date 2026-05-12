<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Web Portfolio

これはポートフォリオサイトのフロントエンドです。

## 技術スタック

- Next.js (App Router) + TypeScript + Tailwind CSS
- CloudFlareにデプロイ

## コーディング規約

- コードは可能な限りシンプルにすること。ただし仕様を削れという意味ではない。要求仕様を妥協無く実装できる最小限のコードを書け。
- 堅牢で保守性が高いコードを書くこと。共通の処理や定数、コンポーネントを切り出して共通化し、後からの修正が簡単になるようにする。各所でハードコードしたり、値の揺れが発生したりしないようにすること。また、各ファイルの責務を明確にし、適切にファイルを分割すること。
- サイトの読み込みなど、動作を高速にすること。動画や画像などの重い素材は非同期で並列に読み込み、準備が完了したものから順次表示するようにするのが良いだろう。
- OGPのフォールバックはしないこと。OGPが取得できないなら画像は白紙のままでいい。
- npm run previewで動作に問題が無いか、好ましくない速度や挙動ではないかを確かめるように。