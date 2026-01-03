# 城上コードメモ ver2.1 (beta) - コードレビュー

作成日: 2025-12-27

---

## 1. サイト概要

**城上コードメモ** は Jekyll を用いた静的サイトジェネレータで構築された個人ブログサイトです。  
GitHub Pages で `https://ruri-sayo.github.io/` 配下にホスティングされることを前提としています。

### 主な機能

- ブログ記事（`_posts`）の公開
- ツール集（`tools/`）：スタンドアロンの HTML ウェブアプリケーション
- ゲーム・アプリ（`game/`）：外部リンクおよび内部ホスティングのゲーム
- 小説（`_novel`）：シリーズ形式の創作コンテンツ

---

## 2. ディレクトリ構造

```
1_WP_CM_blog/
├── _config.yml           # Jekyll 設定ファイル
├── _data/                # データファイル（YAML）
│   ├── games.yml         # ゲーム一覧データ
│   ├── home_novel.yml    # トップページ表示小説設定
│   └── tools.yml         # ツール一覧データ
├── _includes/            # 部分テンプレート
│   └── head.html         # <head>要素の共通部分
├── _layouts/             # レイアウトテンプレート
│   ├── default.html      # ベースレイアウト
│   ├── home.html         # ホームページ
│   ├── post.html         # ブログ記事
│   ├── page.html         # 汎用ページ
│   ├── game_page.html    # ゲームページ
│   ├── novel_series.html # 小説シリーズ
│   └── novel_episode.html# 小説エピソード
├── _novel/               # 小説コレクション
│   ├── fantasy_world/
│   └── stellar_odyssey/
├── _posts/               # ブログ記事（21件）
├── assets/               # 静的アセット
│   ├── css/              # スタイルシート
│   ├── js/               # JavaScript
│   ├── icon/             # アイコン画像
│   └── img/              # 画像
├── game/                 # ゲームセクション
├── tools/                # ツールセクション（19ファイル）
├── posts/                # 記事一覧ページ
├── novel/                # 小説一覧ページ
├── index.html            # トップページ
├── about.markdown        # Aboutページ
├── 404.html              # 404エラーページ
├── robots.txt            # クローラー制御
├── favicon.ico           # ファビコン
├── Gemfile               # Ruby依存関係
└── Gemfile.lock
```

---

## 3. 技術スタック

| カテゴリ | 技術 |
|----------|------|
| 静的サイトジェネレータ | Jekyll 4.4.1 |
| テーマ | Minima 2.5 |
| CSSフレームワーク | Tailwind CSS (CDN) |
| シンタックスハイライト | Rouge |
| 数式レンダリング | MathJax 3 |
| Markdown | kramdown |
| ホスティング | GitHub Pages |

---

## 4. 主要ファイルのレビュー

### 4.1 `_config.yml`

**良い点:**
- パーマリンク形式 (`/posts/:year/:month/:day/:title/`) が整理されている
- デフォルトレイアウト設定で投稿の冗長記述を削減
- `_novel` コレクションが適切に定義されている

**問題点:**
- `description` が空になっている（SEO上望ましくない）

```yaml
description: >- # this means to ignore newlines until "baseurl:"
  
```

**推奨:** サイトの説明文を記載する

---

### 4.2 `_includes/head.html`

**良い点:**
- `noindex, nofollow` で限定公開を明示
- MathJax の設定が適切
- スムーズスクロールが有効

**問題点:**

1. **Tailwind CSS の CDN 利用（パフォーマンス）**
   ```html
   <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
   ```
   - CDN版は本番環境には非推奨（公式ドキュメントでも警告）
   - ビルド時にパージできないため、不要なCSSも読み込まれる
   
   **推奨:** 本番環境では Tailwind CSS をビルドして使用

2. **meta description タグがない**
   - `<meta name="description">` がないため、各ページの説明がGoogle検索結果に反映されない
   
   **推奨:** ページごとの description を設定

---

### 4.3 `_layouts/default.html`

**良い点:**
- ヘッダー・フッターの構造が明確
- レスポンシブナビゲーション対応 (`hidden md:flex`)

**問題点:**

1. **モバイルナビゲーションが機能しない**
   ```html
   <nav class="hidden md:flex space-x-6">
   ```
   モバイル時にナビゲーションが完全に非表示になり、ハンバーガーメニュー等の代替がない。

   **推奨:** モバイル用のナビゲーションメニュー（ハンバーガーメニュー等）を追加

2. **メールアドレスの難読化が不完全**
   ```html
   <p>Email: s@yohin@d@kedo[@gmail.com]※[]以前の@をaに打ち替えてください。</p>
   ```
   - スパムボット対策としては効果が限定的
   - ユーザビリティが低い
   
   **推奨:** JavaScript による難読化またはコンタクトフォームへの置き換えを検討

3. **空のhref属性**
   ```html
   <a href="" >Sayo Social Connect</a>
   ```
   
   **推奨:** 適切なURLを設定するか、リンクを削除

---

### 4.4 `_layouts/home.html`

**良い点:**
- 新着記事、ツール、小説、ゲームセクションが整理されている
- Liquid テンプレートの使い方が適切

**問題点:**

1. **ハードコードされたツールID**
   ```liquid
   {% assign featured_ids = "kazukazoe,sky_high,diff,count" | split: "," %}
   ```
   
   **推奨:** `_data/home_featured.yml` 等に分離して管理しやすくする

2. **小説セクションのフォールバック表示**
   ```html
   <p class="text-gray-600">home_novel.yml にシリーズが設定されていません。</p>
   ```
   
   開発者向けメッセージがユーザーに見える可能性がある。

---

### 4.5 `assets/css/custom.css`

**良い点:**
- Rouge シンタックスハイライトの配色が充実
- prose クラスのカスタマイズが適切
- レスポンシブ対応（メディアクエリ使用）

**問題点:**
- 特になし（良く整備されている）

---

### 4.6 `assets/js/posts-list.js`

**良い点:**
- IIFE でグローバルスコープ汚染を防止
- デバウンス処理で検索パフォーマンスを改善
- XSS 対策として `escapeHtml` 関数を実装

**問題点:**
- 特になし（良い実装）

---

### 4.7 `_data/tools.yml`

**問題点:**

1. **一部ツールに id が設定されていない**
   ```yaml
   - 
     title: TeXレンダラー
     url: /tools/math_changer.html
   ```
   
   **推奨:** 全ツールに一意の id を設定

2. **一部の icon パスが空**
   ```yaml
   - id: henkan
     icon:  
   ```
   
   **推奨:** 空の場合は省略するか、デフォルトアイコンを設定

---

### 4.8 `tools/aaaaa.html` （スピーチ所要時間計算機）

**良い点:**
- モダンなUIデザイン
- リアルタイム計算機能
- コードが整理されている

**問題点:**

1. **ファイル名が不適切**
   - `aaaaa.html` は何の機能か分からない
   
   **推奨:** `speech_time_calculator.html` 等の意味のある名前に変更

2. **独自のTailwind CDN読み込み**
   ```html
   <script src="https://cdn.tailwindcss.com"></script>
   ```
   - サイト全体で既に読み込まれているため重複

---

### 4.9 `404.html`

**問題点:**
- 英語のみの表示（「Page not found :(」）
- サイトのデザインと統一感がない（独自CSS内包）

**推奨:** 日本語化し、サイト全体のデザインに合わせる

---

### 4.10 `about.markdown`

**問題点:**
- Jekyll テーマのデフォルト文言がそのまま残っている
- サイトの実際の情報が記載されていない

**推奨:** サイト・運営者の実際の情報を記載

---

### 4.11 `robots.txt`

```
User-agent: *
Disallow: /
```

**説明:**
- 全クローラーをブロックする設定
- 限定公開サイトとして意図的な設定と思われる

**確認事項:** これが意図した設定であれば問題なし

---

## 5. 問題点サマリー

### 🔴 Critical（重大）

| # | 問題 | 影響 | ファイル |
|---|------|------|----------|
| 1 | モバイルナビゲーションなし | モバイルユーザーがサイト内を移動できない | `_layouts/default.html` |

### 🟡 Warning（警告）

| # | 問題 | 影響 | ファイル |
|---|------|------|----------|
| 2 | Tailwind CSS CDN 使用 | パフォーマンス低下、本番非推奨 | `_includes/head.html` |
| 3 | 意味のないファイル名 | 保守性の低下 | `tools/aaaaa.html` 他 |
| 4 | About ページ未編集 | サイトの信頼性低下 | `about.markdown` |
| 5 | 404 ページが日本語化されていない | UX低下 | `404.html` |
| 6 | meta description 未設定 | SEO への悪影響 | `_config.yml`, `_includes/head.html` |

### 🟢 Info（情報）

| # | 問題 | 影響 | ファイル |
|---|------|------|----------|
| 7 | tools.yml の一部に id がない | home.html でのフィーチャー指定不可 | `_data/tools.yml` |
| 8 | 空の href 属性 | アクセシビリティ警告 | `_layouts/default.html` |
| 9 | 一部ツールの icon が未設定 | プレースホルダー表示 | `_data/tools.yml` |
| 10 | ファビコンサイズが大きい（~450KB） | 読み込み速度への影響 | `favicon.ico` |

---

## 6. 推奨改善事項

### 優先度高

1. **モバイルナビゲーションの追加**
   - ハンバーガーメニュー等を実装
   - JavaScript または Tailwind のミニマル実装を使用

2. **About ページの更新**
   - サイトと運営者の実際の情報を記載

3. **404 ページの日本語化とデザイン統一**

### 優先度中

4. **ファイル名の整理**
   - `aaaaa.html` → `speech_time_calculator.html`
   - `coount_moji.html` → `character_counter.html`（typoも修正）

5. **meta description の追加**
   - `_config.yml` にサイト説明を追加
   - 各ページでも設定できるようにテンプレート修正

6. **Tailwind CSS のビルド環境構築**
   - 本番環境でのパフォーマンス改善

### 優先度低

7. **tools.yml の正規化**
   - 全ツールに id を付与
   - 空の icon フィールドを削除

8. **ファビコンの最適化**
   - 現在約450KBと大きいため、適切なサイズに圧縮

---

## 7. 良い点・参考になる実装

1. **Jekyll コレクションの活用**
   - `_novel` コレクションでシリーズ・エピソード構造を実現

2. **データ駆動設計**
   - `_data/` ディレクトリでコンテンツとテンプレートを分離

3. **Rouge による美しいシンタックスハイライト**
   - GitHub Light 風の配色で可読性が高い

4. **MathJax の適切な設定**
   - インライン・ブロック数式の両方に対応

5. **検索・フィルター機能**
   - `posts-list.js` でクライアントサイド検索を実装

---

## 8. 結論

全体として、Jekyll ベースの個人ブログサイトとして適切に構築されています。  
特にコードレベルでの品質は高く、セキュリティ面（XSSエスケープ等）も考慮されています。

主な改善点は **モバイルナビゲーションの追加** と **コンテンツの充実化**（About ページ、description等）です。  
これらを対応することで、ユーザー体験とサイトの完成度が大きく向上します。

---

*レビュー実施: Antigravity AI*
