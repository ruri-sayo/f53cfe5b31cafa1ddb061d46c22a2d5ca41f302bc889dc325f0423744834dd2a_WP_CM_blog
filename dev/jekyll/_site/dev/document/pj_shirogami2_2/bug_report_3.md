# バグ報告書: 季節イベント機能の不具合

**作成日:** 2025-12-27
**報告者:** Antigravity AI

## 1. 概要
`pj_shirogami2_2` の改良計画に基づき実装された「季節イベント機能」について、ブラウザ上での検証を行った結果、機能が正常に動作していないことが確認されました。

## 2. 再現手順と現象
1. ローカル開発サーバー上のブログトップページにアクセス。
2. ブラウザの開発者コンソールを開く。
3. `window.SHIROGAMI_EVENTS` を確認すると `undefined` である。
4. `window.listEvents()` を実行すると、ヘッダーのみ表示され、イベントリストが出力されない。
5. `window.setEvent('christmas')` 等を実行しても「Event not found」となり、スタイルが適用されない。

## 3. 原因調査
前回の `bug_report_2.md` に基づき修正が行われたはずの `_includes/head.html` ですが、ブラウザでの挙動から、当該箇所の Liquid タグ修正が不十分である、または正しく反映されていない可能性が高いです。

具体的には、`event-mode.js` が `window.SHIROGAMI_EVENTS` を読み込もうとした際、その変数が正しく定義されていない（または構文エラーでスクリプトブロック全体が停止している）ため、初期化に失敗しています。

`event-mode.js` 内では `const EVENTS = window.SHIROGAMI_EVENTS || [];` と定義されており、`window.SHIROGAMI_EVENTS` が未定義の場合は空配列となるため、`listEvents()` が空の結果を返し、`setEvent()` も対象を見つけられずに失敗します。

根本原因は `_includes/head.html` 内の `window.SHIROGAMI_EVENTS` を生成するスクリプト生成部分における、Liquid 構文エラー（あるいは出力されるJSONの構文エラー）が解消されていないことにあります。特に、`start_month` などの数値フィールドの出力において何らかの問題が残っている可能性があります。

## 4. 修正方針
1. `_includes/head.html` の `window.SHIROGAMI_EVENTS` 定義部分を再度確認し、正しい JavaScript オブジェクト配列が出力されるように修正する。
2. 特にカンマ漏れや、不要なスペース、クォートの有無などを再点検する。

## 5. 担当者への依頼
`_includes/head.html` を再調査し、正しいコードに修正してください。修正後、再度ブラウザ検証をお願いします。
