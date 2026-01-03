# バグ報告書: 季節イベントが読み込まれない問題

**作成日:** 2025-12-27
**報告者:** Antigravity AI

## 1. 概要
`改良計画.md` にて実装済みと報告されている「季節イベント」機能（Phase 5）において、ブラウザコンソールで `window.listEvents()` などのコマンドを実行してもイベントが表示されず、イベント機能が動作していない現象が確認されました。

## 2. 原因調査
`_includes/head.html` 内のイベントデータ埋め込み処理、および `assets/js/event-mode.js` を調査しました。

### 調査結果
`_includes/head.html` における Liquid テンプレートタグの記述に誤りがあり、正しく JavaScript 配列が生成されていないことが原因であると判明しました。

**該当箇所:** `_includes/head.html` (37行目付近)
```html
        start_month: { { event.start_month } },
    start_day: { { event.start_day } },
    end_month: { { event.end_month } },
    end_day: { { event.end_day } },
```

Liquid の変数展開は `{{ variable }}` と記述する必要がありますが、現状のコードでは中括弧の間にスペースが含まれており（`{ { ... } }`）、Liquid タグとして認識されず、そのまま文字列として HTML に出力されています。
その結果、生成される JavaScript コードが構文エラー（SyntaxError）となり、`window.SHIROGAMI_EVENTS` の定義に失敗、続く `event-mode.js` の処理も停止している状態です。

## 3. 修正案

`_includes/head.html` の該当箇所のスペースを削除し、正しい Liquid 構文に修正します。

**修正前:**
```html
<script>
  window.SHIROGAMI_EVENTS = [
    {% for event in site.data.events.events %}
  {
    id: "{{ event.id }}",
      name: "{{ event.name }}",
        start_month: { { event.start_month } },
    start_day: { { event.start_day } },
    end_month: { { event.end_month } },
    end_day: { { event.end_day } },
    bg_color: "{{ event.bg_color }}",
// ...
```

**修正後:**
```html
<script>
  window.SHIROGAMI_EVENTS = [
    {% for event in site.data.events.events %}
  {
    id: "{{ event.id }}",
    name: "{{ event.name }}",
    start_month: {{ event.start_month }},
    start_day: {{ event.start_day }},
    end_month: {{ event.end_month }},
    end_day: {{ event.end_day }},
    bg_color: "{{ event.bg_color }}",
// ...
```

## 4. 影響範囲
- `_includes/head.html` のみ。
- この修正により、`assets/js/event-mode.js` が正常にイベントデータを読み込めるようになり、季節イベント機能（背景色変更、ヘッダー色変更、デコレーション表示）が有効になります。

## 5. 作業指示
本レポート確認後、`_includes/head.html` の当該箇所を修正してください。
修正後は、ブラウザの現行ページをリロードし、コンソールで `window.listEvents()` を実行してイベント一覧が表示されることを確認してください。
