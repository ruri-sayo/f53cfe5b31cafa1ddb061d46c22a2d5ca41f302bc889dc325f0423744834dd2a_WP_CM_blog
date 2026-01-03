# Astro + Reactでのツール作成ガイド

## 概要

城上コードメモでは、AstroのアイランドアーキテクチャとReactを組み合わせて、インタラクティブなWebツールを作成します。

この方式のメリット：
- **パフォーマンス**: 静的なHTMLとして配信され、必要な部分だけでReactがハイドレートされる
- **SEO**: 静的HTMLなので検索エンジンに最適化されている
- **開発体験**: Reactの豊富なエコシステム（useState, useEffect等）を活用できる
- **保守性**: コンポーネント単位で管理でき、再利用性が高い

---

## ディレクトリ構造

```
astro-site/
├── src/
│   ├── components/
│   │   └── tools/           # Reactツールコンポーネント
│   │       ├── CharacterCounter.tsx
│   │       ├── DiffCompare.tsx
│   │       └── [新しいツール].tsx
│   ├── pages/
│   │   └── tools/
│   │       ├── index.astro          # ツール一覧
│   │       ├── character-counter.astro
│   │       ├── diff-compare.astro
│   │       └── [新しいツール].astro
│   └── data/
│       └── tools.json       # ツール一覧データ
```

---

## 新しいツールの追加手順

### Step 1: Reactコンポーネントを作成

`src/components/tools/[ToolName].tsx` を作成します。

```tsx
import React, { useState } from 'react';

/**
 * [ツール名]コンポーネント
 * @description ツールの説明
 */
export default function ToolName() {
  // ステート管理
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');

  // 処理ロジック
  const handleProcess = () => {
    // ここに処理を書く
    setResult(`処理結果: ${inputValue}`);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        ツール名
      </h2>

      {/* 入力エリア */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        placeholder="入力してください..."
      />

      {/* 実行ボタン */}
      <button
        onClick={handleProcess}
        className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md mt-4 hover:bg-blue-700 transition"
      >
        実行
      </button>

      {/* 結果表示 */}
      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">{result}</p>
        </div>
      )}
    </div>
  );
}
```

### Step 2: Astroページを作成

`src/pages/tools/[tool-name].astro` を作成します。

```astro
---
/**
 * [ツール名]ページ
 */
import BaseLayout from '../../layouts/BaseLayout.astro';
import ToolName from '../../components/tools/ToolName';
---

<BaseLayout title="ツール名" description="ツールの説明">
  <div class="py-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">ツール名</h1>
      <p class="text-gray-600">ツールの簡単な説明</p>
    </div>
    
    {/* client:load でクライアントサイドでReactをハイドレート */}
    <ToolName client:load />
    
    <div class="max-w-lg mx-auto mt-8 text-sm text-gray-500">
      <h3 class="font-semibold mb-2">使い方</h3>
      <ul class="list-disc list-inside space-y-1">
        <li>使い方の説明1</li>
        <li>使い方の説明2</li>
      </ul>
    </div>
  </div>
</BaseLayout>
```

### Step 3: tools.jsonにエントリを追加

`src/data/tools.json` に新しいツールのエントリを追加します。

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

---

## クライアントディレクティブ

Astroでは、Reactコンポーネントをいつハイドレートするかを制御できます。

| ディレクティブ | 動作 | 使用場面 |
|---|---|---|
| `client:load` | ページロード時に即座にハイドレート | ユーザーがすぐ操作するツール |
| `client:idle` | ブラウザがアイドル状態になったらハイドレート | 優先度が低いインタラクティブ要素 |
| `client:visible` | 要素がビューポートに入ったらハイドレート | スクロールで見えるまで使わないもの |
| `client:only="react"` | SSRせずクライアントのみでレンダリング | SSRでエラーになるコンポーネント |

**推奨**: ツールは基本的に `client:load` を使用します。

---

## スタイリング

Tailwind CSSを使用します。Astroプロジェクトでは TailwindCDN を読み込んでいるため、クラスをそのまま使えます。

```tsx
// Tailwindクラスを直接使用
<div className="bg-white p-4 rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-800">タイトル</h2>
</div>
```

### カラーパレット例

| 用途 | クラス |
|---|---|
| メインボタン | `bg-blue-600 hover:bg-blue-700 text-white` |
| セカンダリボタン | `bg-gray-200 hover:bg-gray-300 text-gray-700` |
| 成功表示 | `bg-green-50 text-green-600` |
| エラー表示 | `bg-red-50 text-red-600` |
| 入力フィールド | `border border-gray-300 focus:ring-2 focus:ring-blue-500` |

---

## 状態管理パターン

### 基本: useState

```tsx
const [value, setValue] = useState('');
```

### 複雑な状態: useReducer

```tsx
const initialState = { count: 0, text: '' };

function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + 1 };
    case 'setText': return { ...state, text: action.payload };
    default: return state;
  }
}

const [state, dispatch] = useReducer(reducer, initialState);
```

### 副作用: useEffect

```tsx
useEffect(() => {
  // マウント時の処理
  const handleResize = () => { /* ... */ };
  window.addEventListener('resize', handleResize);
  
  // クリーンアップ
  return () => window.removeEventListener('resize', handleResize);
}, []); // 依存配列
```

---

## ローカルストレージの利用

ユーザー設定を保存する場合:

```tsx
// 保存
useEffect(() => {
  localStorage.setItem('toolSettings', JSON.stringify(settings));
}, [settings]);

// 読み込み
useEffect(() => {
  const saved = localStorage.getItem('toolSettings');
  if (saved) {
    setSettings(JSON.parse(saved));
  }
}, []);
```

---

## テストとデバッグ

### ローカル開発サーバー

```bash
cd astro-site
npm run dev
```

ブラウザで `http://localhost:4321/` にアクセスして確認。

### ビルド確認

```bash
npm run build
npm run preview
```

---

## 既存HTMLツールからの移行チェックリスト

既存のHTML手書きツールをReactに移行する際の手順:

- [ ] 既存ツールの機能を分析
- [ ] 状態管理の設計（何をstateにするか）
- [ ] イベントハンドラの移植
- [ ] DOMアクセス（getElementById等）をuseRefに置き換え
- [ ] インラインスタイルをTailwindクラスに変換
- [ ] Astroページの作成とclient:loadの設定
- [ ] tools.jsonへの登録
- [ ] 動作確認

---

## FAQ

### Q: 外部ライブラリを使いたい

```bash
cd astro-site
npm install [ライブラリ名]
```

その後、コンポーネント内でimportして使用。

### Q: APIを叩きたい

```tsx
const fetchData = async () => {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();
  setData(data);
};
```

### Q: ファイルアップロード機能を作りたい

```tsx
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
    };
    reader.readAsText(file);
  }
};
```

---

## 参考リンク

- [Astro公式ドキュメント - Reactインテグレーション](https://docs.astro.build/en/guides/integrations-guide/react/)
- [React公式ドキュメント](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**最終更新**: 2026-01-03
