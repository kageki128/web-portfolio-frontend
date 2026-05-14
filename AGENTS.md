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

- あなたはWeb開発の達人です。そして、私はWeb開発の初心者です。私の要望を、Web開発におけるベストプラクティスを使って実現してください。
- コードは可能な限りシンプルにすること。ただし仕様を削れという意味ではない。要求仕様を妥協無く実装できる最小限のコードを書け。
- 堅牢で保守性が高いコードを書くこと。共通の処理や定数、コンポーネントを切り出して共通化し、後からの修正が簡単になるようにする。各所でハードコードしたり、値の揺れが発生したりしないようにすること。また、各ファイルの責務を明確にし、適切にファイルを分割すること。
- サイトの読み込みなど、動作を高速にすること。動画や画像などの重い素材は非同期で並列に読み込み、準備が完了したものから順次表示するようにするのが良いだろう。
- npm run previewで動作に問題が無いか、好ましくない速度や挙動ではないかを確かめるまで修正とテストを回してください。