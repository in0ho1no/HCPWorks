# CLAUDE.md

## 共通ルール

- 大きな変更の前には、短い計画を提示してユーザーの確認を取る
- 次の変更は事前確認を必須とする
  - 依存パッケージの追加
  - 破壊的変更
  - 複数ファイルにまたがる大規模リファクタ
  - 設定ファイルや開発フローの変更
- 変更後は影響範囲に応じて必要最小限の検証を行う

## HCPWorksのルール

### テストについて

- 基本的にテストコードは追加する
- 冗長・ほとんど意味をなさないテストコードなら不要

### ドキュメントについて

- 更新に伴って各README.mdおよびCHANGELOG.mdを更新する
- READMEは4ファイルある。`/README.md`・`/README.en.md`（GitHub表示用）と`/hcpworks/README.md`・`/hcpworks/README.en.md`（拡張機能パッケージ用）。内容は同一に保つこと
- 機能追加した場合は、`/hcpworks/CHANGELOG.md`に簡潔に追記すること。詳細はREADMEに記載しているため。

## HCPWorksのアーキテクチャメモ

### レンダリングパイプライン

```
HCPファイル
  → HCPController（src/hcp_controller.ts）
      ├── extractTables() でテーブルデータを抽出
      └── SVGRenderer.render() でSVGを生成
  → SvgContent（src/svg_content.ts）に格納
  → PreviewManager.updatePreview()（src/preview_manager.ts）
  → Webview に表示
```

### Webview HTMLの生成場所

WebviewのHTML（CSS・JS・レイアウト含む）はすべて `src/svg_content.ts` の `getHtmlWrappedSvg()` 内のテンプレート文字列として生成される。独立したHTMLファイルやCSSファイルは存在しない。

### テスト実行の注意

`npm test` は VSCode の GUI（GTK3）を必要とする。ヘッドレス環境では実行できない。コードの正当性確認は `npm run compile-tests && npm run compile && npm run lint` で代替する。
