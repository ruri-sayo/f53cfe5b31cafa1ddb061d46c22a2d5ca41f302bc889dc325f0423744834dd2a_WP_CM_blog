# 城上コードメモ（Jekyllブログ）

メンテナンスしやすいように、運用時に忘れがちな作業手順とファイル構成をまとめています。サイトは GitHub Pages 上で Jekyll (minima テーマ) を使っており、Tailwind CDN と MathJax をヘッダーに読み込むシンプルな構成です。

## セットアップとローカル確認
1. Ruby と Bundler を用意し、初回は依存関係をインストールします。
   ```bash
   bundle install
   ```
2. 変更を確認するときはローカルサーバーを起動します。
   ```bash
   bundle exec jekyll serve --livereload
   ```
   - `_config.yml` の `baseurl` は GitHub Pages 用にリポジトリ名が入っています。ローカルでは自動で無視されるためそのままで OK です。
3. 本番想定の出力を確認したいときはビルドします。
   ```bash
   bundle exec jekyll build
   ```

## ディレクトリと役割
- `_config.yml`：サイトタイトル・permalink 形式・baseurl など全体設定。
- `_layouts/`：
  - `default.html` がページ共通の枠（ナビゲーション・フッター）。
  - `home.html` がトップページ。最新記事カードと、`featured_ids` で選んだツールリンクを表示。
  - `post.html` が記事本文レイアウト（タイトル・日付・カテゴリ表示）。
  - `page.html` は通常ページ用。
- `_includes/head.html`：`noindex` メタ、Tailwind CDN、MathJax の読み込みなど head 周り。
- `_posts/`：日付付き Markdown 記事（`YYYY-MM-DD-title.md`）。Front Matter で `layout: post` を指定し、`title` / `date` / `categories` / `tags` / `description` を書く。
- `posts/index.html`：記事一覧ページ。`assets/js/posts-list.js` が検索・タグ絞り込みを担当するので、Front Matter の `categories`/`tags` を入れておくとフィルタに反映される。
- `_data/tools.yml`：ツール一覧のメタデータ（タイトル・URL・説明・タグ・アイコン）。トップページの「便利なツール」枠と `/tools/` のカード表示に利用。
- `tools/`：各ツールの HTML 本体と `index.html`（`site.data.tools` をカード表示）。
- `assets/`：`css/style.css`（任意の追加スタイル）、`js/posts-list.js`（記事フィルタ用スクリプト）、`icon/` と `img/`（カード画像やファビコン）。
- そのほか：`404.html` や `about.markdown` などの固定ページは minima 既定の形式で配置。

## 更新手順メモ
### 新しい記事を追加するとき
1. `_posts/` に `YYYY-MM-DD-title.md` 形式でファイルを作成。
2. 冒頭に Front Matter を書く（例）。
   ```yaml
   ---
   layout: post
   title: 記事タイトル
   date: 2025-11-07 12:00:00 +0900
   categories: [カテゴリ1, カテゴリ2]
   tags: [タグ1, タグ2]
   description: 一覧やカードに出す要約文
   ---
   ```
3. `description` はトップ・一覧カードの本文に使われます。未指定の場合は本文冒頭から自動抜粋。
4. 数式は `$...$` / `$$...$$` で MathJax がレンダリングします。
5. `bundle exec jekyll serve` で表示崩れやリンク切れを確認。

### ツールを追加・更新するとき
1. 新規ツールを公開する場合は `tools/` に HTML を置く。画像やアイコンは `assets/icon/` や `assets/img/` に配置。
2. `_data/tools.yml` にエントリを追加。`id`（任意だがトップの featured に使う）、`title`、`url`、`description`、`tag`、`icon` を記入。
3. トップページに優先表示したい場合は `_layouts/home.html` の `featured_ids` 配列に `id` を追加。
4. `/tools/` 一覧は `site.data.tools` をそのままカード化しているので、YAML を更新すれば自動反映されます。

### ナビ・メタ情報を調整したいとき
- ヘッダー・フッターのリンクや表示文言は `_layouts/default.html`。
- `noindex,nofollow` を外したい場合や CDN の読み込みを変える場合は `_includes/head.html`。
- レイアウトや余白の調整は Tailwind クラスで行い、必要に応じて `assets/css/style.css` に追加スタイルを書く。

## デプロイのポイント
- `baseurl`（`_config.yml`）は GitHub Pages のリポジトリ名に合わせる。リポジトリを移動したらここも変更。
- GitHub に push すると自動でビルド・公開される。ローカルビルドでエラーが出ないことを確認してから push する。
- リンク切れを避けるため、ツール URL や画像パスは `relative_url` を使う既存の記述に合わせて記入。

## よく忘れるチェックリスト
- [ ] 記事の `categories`/`tags` を入れて検索・絞り込みで見つけやすくする。
- [ ] ツール追加時は `_data/tools.yml` と `featured_ids` の両方を更新したか確認。
- [ ] アイコン・画像を `assets/` 配下に置き、YAML では先頭スラッシュ付きパスで指定。
- [ ] 公開前に `bundle exec jekyll serve` で目視確認し、必要なら `bundle exec jekyll build` で本番出力もチェック。
