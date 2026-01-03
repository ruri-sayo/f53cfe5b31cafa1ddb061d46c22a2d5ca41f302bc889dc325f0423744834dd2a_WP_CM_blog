# GitHub Actions によるAstroサイトの自動デプロイ

## 概要

このドキュメントでは、GitHub Actions を使用してAstroサイトをGitHub Pagesに自動デプロイする方法を説明します。

## 前提条件

1. GitHubリポジトリが既に存在すること
2. リポジトリの Settings > Pages で GitHub Actions によるデプロイが有効になっていること

---

## セットアップ手順

### Step 1: ワークフローファイルの配置

1. リポジトリのルートに `.github/workflows/` ディレクトリを作成
2. `deploy.yml` ファイルを配置

```bash
mkdir -p .github/workflows
cp dev/replace/action/deploy.yml .github/workflows/
```

### Step 2: astro.config.mjs の確認

`astro-site/astro.config.mjs` に以下の設定があることを確認:

```js
export default defineConfig({
  site: 'https://[ユーザー名].github.io',
  base: '/[リポジトリ名]/',
  // ...
});
```

### Step 3: GitHub リポジトリ設定

1. リポジトリの **Settings** > **Pages** を開く
2. **Source** で「GitHub Actions」を選択
3. **Save** をクリック

### Step 4: デプロイのトリガー

以下のいずれかでデプロイが実行されます：

- `main` ブランチへのプッシュ
- 手動実行（Actions タブ > workflow_dispatch）

---

## ワークフローファイルの解説

`deploy.yml` の主要部分:

```yaml
name: Deploy Astro to GitHub Pages

on:
  push:
    branches: [main]      # mainブランチへのpushでトリガー
  workflow_dispatch:       # 手動実行も可能

permissions:
  contents: read          # コード読み取り権限
  pages: write            # GitHub Pages書き込み権限
  id-token: write         # デプロイトークン

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: astro-site/package-lock.json
      
      - name: Install dependencies
        working-directory: astro-site
        run: npm ci
      
      - name: Build
        working-directory: astro-site
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: astro-site/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## トラブルシューティング

### ビルドエラー

```
Error: Could not resolve entry module
```

→ `astro-site/` ディレクトリで `npm ci` が正しく実行されているか確認

### デプロイ権限エラー

```
Error: The deploy step failed with exit code 1
```

→ リポジトリ Settings > Pages で「GitHub Actions」が選択されているか確認

### 404エラー（デプロイ後）

- `base` 設定がリポジトリ名と一致しているか確認
- ファイルが `dist/` に正しく生成されているか確認

---

## ローカルでのプレビュー確認

デプロイ前にローカルでプレビューすることを推奨:

```bash
cd astro-site
npm run build
npm run preview
```

`http://localhost:4321/[リポジトリ名]/` でアクセス確認

---

## 注意事項

1. **ビルド時間**: 初回ビルドは2-3分かかる場合があります
2. **キャッシュ**: `package-lock.json` が変更されない限り、npm依存関係はキャッシュされます
3. **ブランチ**: デフォルトでは `main` ブランチのみがデプロイ対象です

---

## 参考リンク

- [Astro公式: GitHub Pagesへのデプロイ](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Actions ドキュメント](https://docs.github.com/en/actions)
- [actions/deploy-pages](https://github.com/actions/deploy-pages)

---

**最終更新**: 2026-01-03
