# Astro スターターキット: Minimal (参考資料)

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **ベテラン宇宙飛行士ですか？** このファイルを削除して、楽しんでください！

## 🚀 プロジェクト構造

Astroプロジェクト内には、以下のようなフォルダとファイルがあります：

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astroは `src/pages/` ディレクトリ内の `.astro` または `.md` ファイルを探します。各ページはファイル名に基づいてルートとして公開されます。

`src/components/` は特別なものではありませんが、Astro/React/Vue/Svelte/Preactコンポーネントを配置する場所として使用します。

画像などの静的アセットは `public/` ディレクトリに配置できます。

## 🧞 コマンド

すべてのコマンドは、プロジェクトのルートからターミナルで実行します：

| コマンド                    | 動作                                              |
| :-------------------------- | :------------------------------------------------ |
| `npm install`               | 依存関係をインストール                            |
| `npm run dev`               | `localhost:4321` で開発サーバーを起動             |
| `npm run build`             | 本番用サイトを `./dist/` にビルド                 |
| `npm run preview`           | デプロイ前にビルド結果をローカルでプレビュー      |
| `npm run astro ...`         | `astro add`, `astro check` などのCLIコマンドを実行 |
| `npm run astro -- --help`   | Astro CLIのヘルプを表示                           |

## 👀 もっと知りたいですか？

[公式ドキュメント](https://docs.astro.build)をご覧いただくか、[Discordサーバー](https://astro.build/chat)にご参加ください。

---

**注記**: これはAstro公式スターターキットのREADMEを日本語化したものです。実際のプロジェクト構成については `training_guide.md` を参照してください。
