[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/in0ho1no/HCPWorks/blob/main/hcpworks/LICENSE)
[![VSCode Extension Test](https://github.com/in0ho1no/HCPWorks/actions/workflows/unittest.yml/badge.svg)](https://github.com/in0ho1no/HCPWorks/actions/workflows/unittest.yml)
[![Release](https://img.shields.io/github/v/release/in0ho1no/HCPWorks)](https://github.com/in0ho1no/HCPWorks/releases)
[![Known Vulnerabilities](https://snyk.io/test/github/in0ho1no/HCPWorks/badge.svg?targetFile=hcpworks/package.json)](https://snyk.io/test/github/in0ho1no/HCPWorks?targetFile=hcpworks/package.json)

English version of README.md is <[here](README.en.md)>.

# HCPWorks について

HCPWorks は、HCP チャート形式の .hcp ファイルを VS Code 上で扱いやすくする拡張機能です。
モジュール一覧からプレビューし、そのまま画像として保存できます。

## できること

- .hcp ファイル内の \module を一覧表示
- 選択したモジュールを横並びプレビュー
- 保存時の自動再描画
- PNG / SVG / WebP / JPEG での画像保存
- 描画レベルの切り替え
- シンタックスハイライト、折り畳み、ファイルアイコン、括弧補完

## 使い方

1. .hcp ファイルを開きます。
1. エクスプローラーの HCP Module List からプレビューしたい \module を選びます。
1. プレビューはエディタ横に表示され、ファイル保存時に自動更新されます。
1. 画像として保存したい場合は、プレビューパネルの保存ボタンを使います。
1. 表示レベルを変えたい場合は HCP Preview Level から数値を指定します。

![previewHCPCharts](hcpworks/resources/videos/previewHCPCharts.gif)
### 画像保存について

- PNG: 標準的な出力向け
- SVG: 拡大や再編集向け
- WebP: 軽量化向け
- JPEG: 写真向け。文字や細線はにじみやすい

PNG / WebP / JPEG は 2 倍解像度でラスタライズされます。保存ファイル名は <fileName>_<moduleName>.<extension> です。

## HCPチャートの記法

- インデント（タブまたは半角 4 文字）でレベルを表します
- 各表記は行頭のキーワード（\module など）で判別されます
- \# から始まる行はコメントです

```text
\module sampleModule
\kind 既存変更
\scope public
\data inputValue
\data result
\in inputValue
\mod 入力値を検証する
\out result
\return 正常終了
```

### レベル0に記載できる表記

| 表記 | 内容 | 注意点 |
| --- | --- | --- |
| \module | モジュールの開始 | モジュール名とセットで記載します |
| \kind | モジュールの変更種別 | \module から \table までの間に記載します。Name の下に kind: 値 として表示され、画像出力にも含まれます |
| \scope | モジュールの公開種別 | \module から \table までの間に記載します。Name の下に scope: 値 として表示され、画像出力にも含まれます |
| \table | 補足表 | \module から \data の間に記載します。CSV 形式で扱われ、\table タイトル でキャプションを付けられます。表自体は画像出力に含まれません |

### レベル0以上に記載できる表記

| 表記 | 内容 | 注意点 |
| --- | --- | --- |
| \data | データ定義 | 同名が重複した場合は最初に定義されたものを優先します。\data (補足) の形式で補足表示も可能です |
| \fork | 条件分岐 | - |
| \true | 分岐（真） | \fork 配下で使用します |
| \false | 分岐（偽） | \fork 配下で使用します |
| \branch | 真偽以外の分岐 | - |
| \repeat | 繰り返し | - |
| \mod | 処理内容 | 処理ステップの主記述です |
| \return | 処理の終了 | - |

### レベル0以上に追加できる表記

| 表記 | 内容 | 注意点 |
| --- | --- | --- |
| \in | 入力データ | 最小レベルではモジュール入力、それ以外は処理入力として扱います |
| \out | 出力データ | 最小レベルではモジュール出力、それ以外は処理出力として扱います |
| \drop | 読み捨てる出力 | \out と同様に記載しますが、データ部と接続せず描画もしません |

\data と \in / \out のデータ名照合では、<ins> / <del> の装飾タグ有無を区別しません。

### 補足情報の記法

行全体を (...) または （...） で囲むと、補足情報としてグレーの斜体で表示されます。

- 行内容をトリミングしたとき、先頭が ( または （、末尾が ) または ） である場合に適用されます
- 処理部では図形の代わりに通過垂直線として描画され、前後の流れ線を維持します
- データ部では \data (補足) の形式で補足テキストを表示できます

### 文字列装飾

行中の文字列は以下のタグで装飾できます。\mod 行や \table セル内でも使用できます。

| 記法 | 内容 | 注意点 |
| --- | --- | --- |
| <del>...</del> | 見え消し | 取り消し線 + ピンク系背景で表示します |
| <ins>...</ins> | 追加・変更 | 緑系背景で表示します |

タグは対で使います。入れ子・別タグ混入・不正な開閉は記法エラーとして扱われます。

## 設定

VS Code の設定で HCPWorks を検索すると、次の項目を変更できます。

| 設定キー | 説明 |
| --- | --- |
| hcpworks.SvgBgColor | プレビューと画像出力の背景色 |
| hcpworks.WireColorTable | ワイヤー色の一覧 |
| hcpworks.headerDisplay.showName | Name 表示の有無 |
| hcpworks.headerDisplay.showScope | scope 表示の有無 |
| hcpworks.headerDisplay.showKind | kind 表示の有無 |

## 補助機能

- .hcp 向けシンタックスハイライト
- \module と \table の折り畳み
- .hcp ファイル専用アイコン
- 括弧やクォートの自動補完

## 既知の問題

既知の問題は、[GitHub の issue](https://github.com/in0ho1no/HCPWorks/issues) を参照してください。

## リリースノート

[CHANGELOG](hcpworks/CHANGELOG.md) を参照してください。
