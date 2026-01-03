# バグレポート #1: GitHub Pages本番環境でNovelシリーズが表示されない

**報告日**: 2025-12-27  
**報告者**: Antigravity AI  
**ステータス**: 調査完了・対策立案済み

---

## 1. 現象

### 1.1 症状
- ローカル環境（`bundle exec jekyll serve`）ではNovelシリーズが正常に表示される
- GitHub Pages本番環境ではNovelのホーム（`/novel/`）には到達可能だが、シリーズ一覧が表示されない
- 「シリーズがまだ登録されていません。」というメッセージが表示される

### 1.2 影響範囲
- `/novel/index.html` - シリーズ一覧ページ
- 全2シリーズ: `fantasy_world`, `stellar_odyssey`

---

## 2. 原因調査

### 2.1 調査内容

#### 関連ファイル構成
```
_config.yml          - コレクション定義
_novel/
  ├── fantasy_world/
  │   ├── index.md   - シリーズ情報
  │   ├── 01-prologue.md
  │   └── 02-workshop.md
  └── stellar_odyssey/
      ├── index.md   - シリーズ情報
      └── 01-drift.md
novel/
  └── index.html     - シリーズ一覧表示ページ
```

#### novel/index.html のLiquidフィルタ（問題箇所）
```liquid
{% assign series_docs = site.novel | where: "name", "index.md" | sort_natural: "title" %}
```

### 2.2 推定原因

**主要原因: Jekyllバージョン差異による`name`プロパティの挙動違い**

| 環境 | Jekyllバージョン | `name`プロパティ |
|------|------------------|------------------|
| ローカル | 4.4.1 | ファイル名（`index.md`） |
| GitHub Pages | 3.9.x ※ | フルパス or 異なる値の可能性 |

※ GitHub PagesのデフォルトJekyllバージョン。GitHub Actions経由の場合は異なる可能性あり。

#### 詳細分析

1. **`name`プロパティの不安定性**
   - Jekyllのコレクションドキュメントにおける`name`プロパティは、バージョンや環境によって動作が異なる場合がある
   - ローカルでは`name`が`index.md`と評価されるが、本番では異なるパス表現（例: `fantasy_world/index.md`）になる可能性

2. **GitHub PagesのJekyll環境**
   - 現在のGemfileにはGitHub Pages gemが含まれていない
   - `github-pages` gemを使用していない場合、ローカルと本番でJekyllバージョンが大きく異なる

3. **パスの正規化問題**
   - Windowsローカル環境とLinuxベースのGitHub Actions環境でのパス区切り文字の違い

---

## 3. 対策

### 3.1 推奨対策: `path`プロパティを使用した安全なフィルタリング

**Before（現在の実装）:**
```liquid
{% assign series_docs = site.novel | where: "name", "index.md" | sort_natural: "title" %}
```

**After（修正版）:**
```liquid
{% assign series_docs = site.novel | where_exp: "doc", "doc.path contains '/index.md'" | sort_natural: "title" %}
```

または、フロントマターに明示的なフラグを追加：

**_novel/fantasy_world/index.md:**
```yaml
---
layout: novel_series
series_id: fantasy_world
is_series_index: true  # ← 追加
title: "ファンタジー・ワールドの扉"
---
```

**修正版Liquid:**
```liquid
{% assign series_docs = site.novel | where: "is_series_index", true | sort_natural: "title" %}
```

### 3.2 補助対策: Gemfileの整合性確保

GitHub PagesとローカルでJekyllバージョンを一致させるため、以下のいずれかを実施：

**オプションA: github-pages gemを使用**
```ruby
# Gemfile
gem "github-pages", group: :jekyll_plugins
```

**オプションB: GitHub Actionsで明示的にJekyll 4.x を使用**
- `.github/workflows/jekyll.yml` でJekyll 4.xを指定

---

## 4. 検証方法

### 4.1 ローカル検証
1. 上記の修正を適用
2. `bundle exec jekyll serve` でローカル確認
3. `/novel/` ページでシリーズが表示されることを確認

### 4.2 本番検証
1. 修正をコミット・プッシュ
2. GitHub Pagesのデプロイ完了を待機
3. 本番URL（`https://ruri-sayo.github.io/...`）で確認

---

## 5. 結論

### 根本原因
`novel/index.html` の Liquid フィルタで使用している `name` プロパティが、ローカル環境（Jekyll 4.4.1）と GitHub Pages 本番環境で異なる値を返すため、シリーズを正しくフィルタリングできていない。

### 推奨アクション
1. **即時対応（優先度高）**: `where_exp` フィルタを使用した堅牢なフィルタリングに変更
2. **中期対応（推奨）**: 各シリーズの`index.md`に`is_series_index: true`フラグを追加し、明示的なフィルタリングを実装
3. **長期対応（検討）**: GitHub PagesとローカルのJekyllバージョンを統一

---

## 6. 関連ファイル

- [novel/index.html](file:///c:/Users/miura/WP_blog/1_WP_CM_blog/novel/index.html) - 修正対象
- [_novel/fantasy_world/index.md](file:///c:/Users/miura/WP_blog/1_WP_CM_blog/_novel/fantasy_world/index.md)
- [_novel/stellar_odyssey/index.md](file:///c:/Users/miura/WP_blog/1_WP_CM_blog/_novel/stellar_odyssey/index.md)
- [_config.yml](file:///c:/Users/miura/WP_blog/1_WP_CM_blog/_config.yml)

---

*レポート作成: Antigravity AI*
