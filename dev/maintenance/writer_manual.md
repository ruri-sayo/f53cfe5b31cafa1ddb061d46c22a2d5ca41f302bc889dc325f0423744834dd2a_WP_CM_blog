# 城上コードメモ - 執筆者マニュアル

このドキュメントでは、ブログへのコンテンツ追加方法を説明します。

---

## 目次

1. [記事の追加](#1-記事の追加)
2. [ツールの追加](#2-ツールの追加)
3. [ゲームの追加](#3-ゲームの追加)
4. [小説(Novel)の追加](#4-小説novelの追加)
5. [ホーム画面の設定](#5-ホーム画面の設定)
6. [注意事項](#6-注意事項)

---

## 1. 記事の追加

### 1.1 ファイル作成

`src/content/posts/` ディレクトリに新規Markdownファイルを作成します。

**ファイル名の規則**:
```
YYYY-MM-DD-title-slug.md
```

例: `2026-01-03-new-article.md`

### 1.2 フロントマター

ファイルの先頭に以下のYAMLフロントマターを記述:

```markdown
---
title: "記事のタイトル"
description: "記事の概要（検索結果やカードに表示）"
date: 2026-01-03
categories: ["技術", "備忘録"]
tags: ["Astro", "React"]
---

ここから本文を書きます。
```

**必須項目**:
- `title`: 記事タイトル

**任意項目**:
- `description`: 記事の概要
- `date`: 公開日（省略時はファイル名から推測）
- `categories`: カテゴリ（配列または文字列）
- `tags`: タグ（配列または文字列）

### 1.3 本文の書き方

通常のMarkdown記法が使えます:

```markdown
## 見出し2

本文テキスト。**太字**、*斜体*、`コード`。

### 見出し3

- リスト1
- リスト2

```javascript
// コードブロック
console.log("Hello!");
```

![画像の説明](/assets/img/example.webp)
```

### 1.4 画像の追加

1. 画像ファイルを `public/assets/img/` に配置
2. 本文中で参照: `![alt](/assets/img/filename.webp)`

**推奨フォーマット**: WebP または AVIF（ファイルサイズ最適化のため）

---

## 2. ツールの追加

### 2.1 React版ツール（推奨）

#### Step 1: Reactコンポーネントを作成

`src/components/tools/ToolName.tsx` を作成:

```tsx
import React, { useState } from 'react';

export default function ToolName() {
  const [value, setValue] = useState('');
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">ツール名</h2>
      {/* ツールのUI */}
    </div>
  );
}
```

#### Step 2: Astroページを作成

`src/pages/tools/tool-name.astro` を作成:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ToolName from '../../components/tools/ToolName';
---

<BaseLayout title="ツール名" description="ツールの説明">
  <div class="py-8">
    <ToolName client:load />
  </div>
</BaseLayout>
```

#### Step 3: tools.jsonに登録

`src/data/tools.json` に追加:

```json
{
  "id": "tool_id",
  "title": "ツール名",
  "url": "/tools/tool-name/",
  "description": "ツールの説明",
  "tag": "カテゴリ",
  "icon": "/assets/icon/tool_icon.avif"
}
```

### 2.2 HTML版ツール（既存互換）

1. `public/tools/` にHTMLファイルを配置
2. `src/data/tools.json` に登録（URLは `/tools/filename.html`）

---

## 3. ゲームの追加

### 3.1 ファイル配置

`public/game/game-name/` ディレクトリを作成:

```
public/game/game-name/
├── index.html      # メインHTML
├── css/
│   └── style.css   # スタイル
└── js/
    └── main.js     # ロジック
```

### 3.2 games.jsonに登録

`src/data/games.json` に追加:

```json
{
  "title": "ゲーム名",
  "url": "/game/game-name/",
  "description": "ゲームの説明",
  "tag": "ジャンル",
  "platform": "mobile"
}
```

**platform値**:
- `"mobile"`: スマホ対応（緑アイコン）
- `"pc"`: PC推奨（青アイコン）

---

## 4. 小説(Novel)の追加

### 4.1 新規シリーズの作成

`src/content/novel/series-id/` ディレクトリを作成:

```
src/content/novel/series-id/
├── index.md           # シリーズトップ（必須）
├── 01-prologue.md     # エピソード1
├── 02-chapter1.md     # エピソード2
└── ...
```

### 4.2 シリーズインデックス (index.md)

```markdown
---
title: "シリーズタイトル"
series_id: "series-id"
is_series_index: true
short_description: "シリーズ概要"
status: "ongoing"
order: 1
---

シリーズの紹介文...
```

**status値**: `"ongoing"`（連載中）, `"finished"`（完結）

### 4.3 エピソードファイル

```markdown
---
title: "エピソードタイトル"
series_id: "series-id"
episode: 1
---

本文...
```

---

## 5. ホーム画面の設定

### 5.1 ヒーローエリア

`src/data/hero.json` を編集:

```json
{
  "enabled": true,
  "title": "メインメッセージ",
  "subtitle": "サブタイトル",
  "bg_class": "bg-gradient-to-r from-blue-500 to-purple-600"
}
```

### 5.2 ピックアップツール

`src/pages/index.astro` 内の `featuredToolIds` を編集:

```javascript
const featuredToolIds = ["tool_id1", "tool_id2", "tool_id3"];
```

### 5.3 表示記事数

`src/pages/index.astro` 内の `.slice(0, 5)` を変更:

```javascript
.slice(0, 10)  // 最新10件を表示
```

---

## 6. 注意事項

### 6.1 ファイル命名規則

- **記事**: `YYYY-MM-DD-title-slug.md`（ハイフン区切り）
- **ツール/ゲーム**: `kebab-case`（小文字ハイフン）
- **画像**: 半角英数字、アンダースコア可

### 6.2 画像サイズ

| 用途 | 推奨サイズ | フォーマット |
|------|-----------|-------------|
| 記事内画像 | 幅800px以下 | WebP |
| アイコン | 128x128px | AVIF |
| ヒーロー | 1920x1080px | WebP |

### 6.3 ビルド確認

公開前に必ずローカルビルドを確認:

```bash
npm run build
npm run preview
```

### 6.4 禁止事項

- ❌ `{{ }}` Liquid構文は使用不可（Astroでは動作しない）
- ❌ `src/content/` 内に `.astro` ファイルは配置不可
- ❌ ファイル名に日本語・スペースは使用不可

### 6.5 困ったら

- ビルドエラー: `npm run build` のエラーメッセージを確認
- 表示確認: `npm run dev` で開発サーバー起動
- 詳細: `dev/maintenance/training_guide.md` を参照

---

**最終更新**: 2026-01-03
