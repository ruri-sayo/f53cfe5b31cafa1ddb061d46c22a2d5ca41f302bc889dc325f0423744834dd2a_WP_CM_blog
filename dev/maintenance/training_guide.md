# 城上コードメモ - システム研修資料

このドキュメントでは、ブログシステム全体の仕組みを説明します。
新規参画者やメンテナンス担当者向けの研修資料です。

---

## 目次

1. [システム概要](#1-システム概要)
2. [技術スタック](#2-技術スタック)
3. [ディレクトリ構造](#3-ディレクトリ構造)
4. [コンテンツ管理](#4-コンテンツ管理)
5. [ビルドとデプロイ](#5-ビルドとデプロイ)
6. [主要ファイル解説](#6-主要ファイル解説)
7. [開発フロー](#7-開発フロー)

---

## 1. システム概要

### 1.1 城上コードメモとは

「城上コードメモ」は以下のコンテンツを提供する個人ブログサイトです：

- **ブログ記事**: 技術備忘録、意見記事など
- **Webツール**: 文字数カウント、Diff比較など
- **ブラウザゲーム**: 大富豪、迷路ゲームなど
- **創作小説**: オリジナルシリーズ作品

### 1.2 SSG (Static Site Generator) 方式

このサイトは **Astro** フレームワークによる静的サイト生成（SSG）を採用しています。

```
[Markdownファイル] → [Astroビルド] → [静的HTML] → [GitHub Pages配信]
```

**メリット**:
- 高速なページ読み込み
- サーバー不要（GitHub Pagesで無料ホスティング）
- セキュリティリスクが低い
- SEOに最適化

---

## 2. 技術スタック

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| フレームワーク | Astro 5.x | SSG、ルーティング |
| UIライブラリ | React 19 | インタラクティブなツール |
| スタイリング | Tailwind CSS | CSSフレームワーク |
| 型システム | TypeScript | 型安全性 |
| ホスティング | GitHub Pages | 静的サイト配信 |
| CI/CD | GitHub Actions | 自動ビルド・デプロイ |

### 2.1 Astroの特徴

Astroは「アイランドアーキテクチャ」を採用:

- **静的HTML**: ほとんどのページは純粋なHTML
- **アイランド**: 必要な部分だけReactなどでインタラクティブに
- **ゼロJS**: デフォルトではクライアントJSを送信しない

```astro
<!-- 静的部分 -->
<h1>タイトル</h1>

<!-- インタラクティブ部分(アイランド) -->
<ReactComponent client:load />
```

---

## 3. ディレクトリ構造

```
/ (プロジェクトルート)
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions デプロイ設定
│
├── public/                      # 静的ファイル（そのまま配信）
│   ├── assets/
│   │   ├── css/                # CSSファイル
│   │   ├── js/                 # JavaScriptファイル
│   │   ├── img/                # 画像ファイル
│   │   └── icon/               # アイコン画像
│   ├── tools/                  # 既存HTMLツール
│   ├── game/                   # ゲームファイル
│   ├── favicon.svg             # ファビコン
│   └── robots.txt              # クローラー設定
│
├── src/                         # ソースコード（ビルド対象）
│   ├── components/              # 再利用可能コンポーネント
│   │   ├── Head.astro          # <head>タグ共通部分
│   │   └── tools/              # Reactツールコンポーネント
│   │       ├── CharacterCounter.tsx
│   │       ├── DiffCompare.tsx
│   │       ├── SpeechTimer.tsx
│   │       └── RPathConverter.tsx
│   │
│   ├── layouts/                 # ページレイアウト
│   │   ├── BaseLayout.astro    # 基本レイアウト（ヘッダー/フッター）
│   │   ├── PostLayout.astro    # 記事用レイアウト
│   │   ├── NovelSeriesLayout.astro  # 小説シリーズ用
│   │   └── NovelEpisodeLayout.astro # 小説エピソード用
│   │
│   ├── pages/                   # ページ（URLに対応）
│   │   ├── index.astro         # トップページ /
│   │   ├── about.astro         # /about/
│   │   ├── contact.astro       # /contact/
│   │   ├── 404.astro           # 404エラーページ
│   │   ├── posts/
│   │   │   ├── index.astro     # /posts/ 記事一覧
│   │   │   └── [...slug].astro # /posts/YYYY/MM/DD/title/ 動的ルーティング
│   │   ├── tools/
│   │   │   ├── index.astro     # /tools/ ツール一覧
│   │   │   └── *.astro         # 各ツールページ
│   │   ├── game/
│   │   │   └── index.astro     # /game/ ゲーム一覧
│   │   └── novel/
│   │       ├── index.astro     # /novel/ シリーズ一覧
│   │       └── [...slug].astro # 動的ルーティング
│   │
│   ├── content/                 # コンテンツコレクション
│   │   ├── config.ts           # コレクション定義（スキーマ）
│   │   ├── posts/              # ブログ記事 (Markdown)
│   │   │   ├── 2025-10-14-bibouroku.md
│   │   │   └── ...
│   │   └── novel/              # 小説コンテンツ
│   │       ├── fantasy_world/
│   │       └── stellar_odyssey/
│   │
│   ├── data/                    # JSONデータファイル
│   │   ├── tools.json          # ツール一覧
│   │   ├── games.json          # ゲーム一覧
│   │   ├── hero.json           # ヒーローエリア設定
│   │   └── events.json         # イベント設定
│   │
│   └── consts.ts                # 定数・ヘルパー関数
│
├── dev/                         # 開発用ドキュメント
│   ├── maintenance/            # メンテナンス資料
│   ├── replace/                # 移行関連資料
│   └── jekyll/                 # 旧Jekyll資産（アーカイブ）
│
├── dist/                        # ビルド出力（git管理外）
│
├── astro.config.mjs             # Astro設定
├── tsconfig.json                # TypeScript設定
├── package.json                 # npm設定
└── README.md                    # プロジェクト概要
```

---

## 4. コンテンツ管理

### 4.1 Content Collections

Astroの「Content Collections」機能でMarkdownコンテンツを管理。

**定義ファイル**: `src/content/config.ts`

```typescript
const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    categories: z.union([z.array(z.string()), z.string()]).optional(),
  }),
});
```

### 4.2 コンテンツの流れ

```
1. src/content/posts/2026-01-03-example.md (Markdown作成)
        ↓
2. src/content/config.ts (スキーマ検証)
        ↓
3. src/pages/posts/[...slug].astro (動的ルーティング)
        ↓
4. src/layouts/PostLayout.astro (レイアウト適用)
        ↓
5. dist/posts/2026/01/03/example/index.html (HTML生成)
```

### 4.3 データファイル

JSONファイルでリスト系データを管理:

| ファイル | 用途 |
|----------|------|
| `tools.json` | ツール一覧（タイトル、URL、説明等） |
| `games.json` | ゲーム一覧 |
| `hero.json` | トップページヒーローエリア設定 |
| `events.json` | 期間限定イベント設定 |

---

## 5. ビルドとデプロイ

### 5.1 ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動（ホットリロード対応）
npm run dev
# → http://localhost:4321/

# 本番ビルド
npm run build

# ビルド結果プレビュー
npm run preview
```

### 5.2 GitHub Actions 自動デプロイ

`.github/workflows/deploy.yml` により自動化:

```
[mainブランチにpush]
        ↓
[GitHub Actions起動]
        ↓
[npm ci → npm run build]
        ↓
[dist/をGitHub Pagesにデプロイ]
        ↓
[公開: https://ユーザー名.github.io/リポジトリ名/]
```

### 5.3 デプロイフロー図

```
ローカル                    GitHub                     公開
┌─────────┐               ┌─────────────┐            ┌──────────────┐
│ 編集    │──git push───→│ main push   │            │ GitHub Pages │
│ ビルド  │               │ Actions起動 │───────────→│ サイト公開   │
│ 確認    │               │ ビルド実行  │            │              │
└─────────┘               └─────────────┘            └──────────────┘
```

---

## 6. 主要ファイル解説

### 6.1 astro.config.mjs

```javascript
export default defineConfig({
  site: 'https://ユーザー名.github.io',
  base: '/リポジトリ名/',
  integrations: [react()],
});
```

- `site`: 本番URL
- `base`: サブディレクトリパス
- `integrations`: React等の追加機能

### 6.2 src/consts.ts

```typescript
// サイト定数
export const SITE_TITLE = '城上コードメモ v2.2';
export const BASE_URL = import.meta.env.BASE_URL;

// URL生成ヘルパー
export function getFullPath(path: string) { ... }
export function getPostUrl(slug: string) { ... }
```

### 6.3 BaseLayout.astro

全ページ共通のレイアウト:

```astro
---
import Head from '../components/Head.astro';
---

<html>
  <Head title={title} />
  <body>
    <header>ナビゲーション</header>
    <main>
      <slot /> <!-- ページ固有コンテンツ -->
    </main>
    <footer>フッター</footer>
  </body>
</html>
```

---

## 7. 開発フロー

### 7.1 新機能追加の流れ

```
1. featureブランチ作成
   git checkout -b feature/new-feature

2. ローカル開発・テスト
   npm run dev

3. ビルド確認
   npm run build

4. コミット・プッシュ
   git add -A
   git commit -m "feat: 新機能追加"
   git push origin feature/new-feature

5. プルリクエスト作成 → レビュー → マージ

6. mainマージ後、自動デプロイ実行
```

### 7.2 トラブルシューティング

| 問題 | 対処法 |
|------|--------|
| ビルドエラー | `npm run build` のエラーメッセージを確認 |
| 404エラー | URLパスと`base`設定を確認 |
| 画像表示されない | `/assets/img/`からのパスを確認 |
| Reactが動作しない | `client:load`ディレクティブを確認 |

### 7.3 参考ドキュメント

- [Astro公式ドキュメント](https://docs.astro.build/)
- [React公式ドキュメント](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- `dev/replace/how_tool_make.md`: ツール作成ガイド
- `dev/replace/how_test.md`: テストガイド

---

## 付録: 用語集

| 用語 | 説明 |
|------|------|
| SSG | Static Site Generator。静的サイト生成。 |
| Content Collections | AstroのMarkdown管理機能 |
| アイランド | 静的ページ内のインタラクティブ部分 |
| フロントマター | Markdownファイル先頭のYAMLメタデータ |
| スラグ | URLに使われる識別子（例: `my-article`） |

---

**最終更新**: 2026-01-03
