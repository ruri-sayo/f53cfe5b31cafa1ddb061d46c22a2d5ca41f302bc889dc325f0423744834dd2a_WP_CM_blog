# Astro移行プロジェクト スケジュール & 計画書

**作成日**: 2026年1月3日
**関連文書**: `report_1.md`

---

## 1. プロジェクト概要

Jekyll製ブログ「城上コードメモ v2.2」を、Astroへ移行するプロジェクトの詳細計画書です。

### 1.1. 移行対象の資産一覧

| カテゴリ | ファイル数 | 備考 |
| :--- | :--- | :--- |
| ブログ記事 (`_posts`) | 22件 | Markdown形式 |
| 小説 (`_novel`) | 5件 | カスタムコレクション |
| Webツール (`tools`) | 19件 | 独立したHTML/JS |
| ゲーム (`game`) | 4件 (3サブディレクトリ) | 独立したHTML/JS/CSS |
| レイアウト (`_layouts`) | 7件 | Liquidテンプレート |
| データファイル (`_data`) | 5件 | YAML形式 |

---

## 2. フェーズ別移行スケジュール

### Phase 0: 準備・環境構築 (0.5日)

**目標**: Astro開発環境を構築し、基本的なプロジェクト構造を作成する。

| タスク | 詳細 | 所要時間 |
| :--- | :--- | :--- |
| Node.js確認 | Node.js v18以上がインストールされていることを確認 | 5分 |
| プロジェクト作成 | `npm create astro@latest -- --template minimal` を実行 | 10分 |
| 基本設定 | `astro.config.mjs` に `base` (GitHub Pagesのサブパス) を設定 | 15分 |
| Git設定 | `.gitignore` に `node_modules`, `dist` 等を追加 | 10分 |

---

### Phase 1: コンテンツ移行 (1日)

**目標**: Markdownコンテンツ（記事・小説）をAstroのContent Collectionsへ移行する。

#### 1.1. ブログ記事 (`_posts` → `src/content/posts/`)

| タスク | 詳細 | 注意点 |
| :--- | :--- | :--- |
| ファイルコピー | `_posts/*.md` を `src/content/posts/` へ移動 | - |
| Frontmatter修正 | `layout` キーを削除（Astroでは不要） | Jekyllの `layout: post` は削除 |
| スキーマ定義 | `src/content/config.ts` でブログ記事のスキーマを定義 | `title`, `date`, `categories`, `tags` 等 |
| 日付形式確認 | `date` が `YYYY-MM-DD` 形式であることを確認 | - |

#### 1.2. 小説 (`_novel` → `src/content/novel/`)

| タスク | 詳細 | 注意点 |
| :--- | :--- | :--- |
| ファイルコピー | `_novel/*.md` を `src/content/novel/` へ移動 | - |
| スキーマ定義 | `src/content/config.ts` で小説用のスキーマを追加 | `series`, `episode` など独自キー |

---

### Phase 2: レイアウト・コンポーネント移植 (2日)

**目標**: Jekyllのレイアウト・インクルードをAstroコンポーネントへ書き換える。

| 移行元ファイル | 移行先ファイル | 作業内容 |
| :--- | :--- | :--- |
| `_layouts/default.html` | `src/layouts/BaseLayout.astro` | `<head>`, ヘッダー, フッター, 共通構造を移植 |
| `_layouts/post.html` | `src/layouts/PostLayout.astro` | 記事ページ専用レイアウト |
| `_layouts/home.html` | `src/pages/index.astro` | トップページ |
| `_layouts/novel_*.html` | `src/layouts/NovelLayout.astro` | 小説用レイアウト |
| `_includes/head.html` | `src/components/Head.astro` | `<head>` 内のメタタグ等 |

#### 主な書き換えポイント

| Liquid (Jekyll) | Astro |
| :--- | :--- |
| `{{ site.title }}` | `{Astro.site}` または `import.meta.env` |
| `{{ content }}` | `<slot />` |
| `{% for post in site.posts %}` | `posts.map((post) => ...)` (JS) |
| `{% include head.html %}` | `import Head from '../components/Head.astro'` |

---

### Phase 3: 静的ページ・データ移行 (1日)

**目標**: 固定ページやデータファイルを移行する。

| 移行対象 | 作業内容 |
| :--- | :--- |
| `about.markdown` | `src/pages/about.astro` または `src/pages/about.md` として配置 |
| `contact.html` | `src/pages/contact.astro` として書き換え |
| `404.html` | `src/pages/404.astro` として配置 |
| `_data/*.yml` | `src/data/*.json` または TypeScriptファイルとして移行。`import` で読み込む |

---

### Phase 4: ツール・ゲーム統合 (2日)

**目標**: 既存のHTML/JSツール・ゲームをAstroプロジェクト内で動作させる。

#### 4.1. 単純統合アプローチ（推奨）

Astroの `public/` ディレクトリを利用し、既存のツール・ゲームをそのまま配置する。

| 作業内容 | 詳細 |
| :--- | :--- |
| ディレクトリコピー | `tools/` → `public/tools/`, `game/` → `public/game/` |
| パス確認 | CSS/JS/画像への相対パスが正しいことを確認 |
| 動作テスト | ローカルサーバーで各ツール・ゲームが動作するか確認 |

**メリット**: 移行コストがほぼゼロ。既存コードに一切変更を加えない。
**デメリット**: Astroのビルドパイプライン（最適化等）の恩恵を受けられない。

#### 4.2. Astroアイランド化（将来の改善案）

将来的に、ツールをReact/Preact/Svelteコンポーネントとして書き換え、Astroアイランドとして埋め込むことで、パフォーマンスと保守性を向上させることが可能。

---

### Phase 5: スタイル・アセット移行 (0.5日)

**目標**: CSS、画像、フォントなどの静的アセットを移行する。

| 作業内容 | 詳細 |
| :--- | :--- |
| CSSコピー | `assets/css/` → `src/styles/` または `public/assets/css/` |
| 画像コピー | `assets/images/`, `favicon*.png` → `public/` |
| CSS参照変更 | レイアウトファイル内のCSSパスを更新 |

---

### Phase 6: テスト・デバッグ (1日)

**目標**: 全ページの表示確認と機能テストを行う。

| テスト項目 | チェックポイント |
| :--- | :--- |
| トップページ | 記事一覧が正しく表示されるか |
| 記事詳細ページ | Markdownが正しくレンダリングされるか、コードハイライトが効いているか |
| 小説ページ | シリーズ・エピソード構造が正しく表示されるか |
| ツールページ | 各ツールが正常に動作するか |
| ゲームページ | 各ゲームが正常にプレイできるか |
| レスポンシブ | モバイル・タブレット表示が崩れないか |
| リンク・パーマリンク | 旧URLと同等のパス構造になっているか (`/posts/YYYY/MM/DD/title/`) |
| SEO | OGP、description、faviconが正しく設定されているか |

---

### Phase 7: デプロイ・公開 (0.5日)

**目標**: GitHub Pagesへデプロイし、本番公開する。

| 作業内容 | 詳細 |
| :--- | :--- |
| ビルド確認 | `npm run build` でエラーがないことを確認 |
| GitHub Actions設定 | `.github/workflows/deploy.yml` を作成（Astro公式テンプレートを使用） |
| `base` 設定 | `astro.config.mjs` の `base` がGitHub Pagesのサブディレクトリと一致しているか確認 |
| Push & 確認 | `main` ブランチへPushし、GitHub ActionsでビルドされたPagesを確認 |

---

## 3. 想定スケジュール（サマリー）

```
Day 1 (0.5日): Phase 0 - 環境構築
         └──→ Phase 1 (前半) - 記事移行開始
Day 2 (1日):   Phase 1 (後半) - 記事・小説移行完了
         └──→ Phase 2 (前半) - レイアウト移植開始
Day 3 (1日):   Phase 2 (後半) - レイアウト移植完了
         └──→ Phase 3 - 静的ページ・データ移行
Day 4 (1日):   Phase 4 - ツール・ゲーム統合
Day 5 (1日):   Phase 4 (継続) + Phase 5 - スタイル移行
Day 6 (1日):   Phase 6 - テスト・デバッグ
Day 7 (0.5日): Phase 7 - デプロイ・公開
-------------------------------------------
合計: 約7日間 (実作業ベース)
```

週末を挟む場合や、作業時間が限られる場合は、**2〜3週間** を目安とするのが現実的です。

---

## 4. 移行時の注意点

### 4.1. パーマリンク構造の維持 (重要)

現在のJekyll設定では、記事URLが `/posts/:year/:month/:day/:title/` となっています。
Astroでもこの構造を維持しないと、検索エンジンの評価や既存の外部リンクが無効になります。

**対策**: `src/pages/posts/[...slug].astro` のような動的ルーティングを使用し、Frontmatterの `date` からパスを生成するロジックを実装する。

### 4.2. RSSフィード

Jekyllの `jekyll-feed` プラグインが生成していたRSSフィード (`/feed.xml`) は、Astroでは `@astrojs/rss` パッケージを使って再実装する必要があります。

### 4.3. Liquid構文の完全削除

Markdown記事本文中にLiquid構文（`{% ... %}`, `{{ ... }}`）が含まれている場合、Astroではエラーになります。事前にコンテンツを確認し、該当箇所があれば書き換えてください。

### 4.4. MathJax / KaTeX

現在 `kramdown` で `mathjax` を使用しています。Astroでは `remark-math` と `rehype-katex` (または `rehype-mathjax`) を組み合わせて対応できます。

### 4.5. イベントモード (`events.yml`)

現在のJavaScriptベースのイベントモード機能 (`event-mode.js`) は、Astroでもそのまま動作させるか、ビルド時に静的に埋め込むかを選択できます。

---

## 5. リスクと代替案

| リスク | 影響 | 代替案 |
| :--- | :--- | :--- |
| レイアウト移植が想定より複雑 | スケジュール遅延 | Phase 2を2日→3日に延長 |
| ツール/ゲームがAstro環境で動作しない | 機能低下 | `public/` への配置で回避（Phase 4.1） |
| パーマリンク構造の再現が困難 | SEO低下、リンク切れ | リダイレクト設定、または 301リダイレクトページの作成 |

---

## 6. 成功基準

以下の条件をすべて満たした場合、移行プロジェクトを完了とします。

-   [ ] 全22件のブログ記事が正しく表示される。
-   [ ] 全5件の小説が正しく表示される。
-   [ ] 全19件のWebツールが正常に動作する。
-   [ ] 全4件のゲームが正常にプレイできる。
-   [ ] GitHub Pagesで公開され、現行URLでアクセス可能。
-   [ ] RSSフィードが生成されている。
-   [ ] Lighthouseスコア（Performance）が80以上。

---

以上がAstroへの移行計画です。
ご不明点や追加のご要望があれば、お知らせください。
