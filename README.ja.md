[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/in0ho1no/HCPWorks/blob/main/hcpworks/LICENSE)
[![VSCode Extension Test](https://github.com/in0ho1no/HCPWorks/actions/workflows/unittest.yml/badge.svg)](https://github.com/in0ho1no/HCPWorks/actions/workflows/unittest.yml)
[![Release](https://img.shields.io/github/v/release/in0ho1no/HCPWorks)](https://github.com/in0ho1no/HCPWorks/releases)

English version of README.md is <[here](README.md)>.

# HCPWorks について

HCPWorksは、HCPチャート形式で記述されたテキストファイルをプレビューできるVSCode拡張機能です。
HCPチャートの作成プロセスをVSCode内で完結できるようにすることで、効率化を目指しています。

## 機能

### HCP チャートのプレビュー

#### プレビュー

HCPチャートをプレビューします。

1. 「.hcp」ファイルを選択します。
1. 「\module」で始まるチャートが一覧表示されます。
1. 任意のモジュールを選択します。
1. HCP チャートがプレビューされます。

![previewHCPCharts](hcpworks/resources/videos/previewHCPCharts.gif)

#### 再読み込み

ファイルを保存すると、プレビューが自動的に更新されます。

1. プレビューされた「.hcp」ファイルを編集します。
1. ファイルを保存します。
1. プレビューが自動的に更新されます。

![reloadHCPCharts](hcpworks/resources/videos/reloadHCPCharts.gif)

#### 保存

HCPチャートを保存します。

1. タブバーに表示される保存用ボタンをクリックします。  
保存用ボタンは、".hcp"ファイルのパネルもしくはHCPチャートのプレビューパネルに表示されます。
1. "SVG"画像が保存されます。
1. SVG画像の命名規則は右記の通りです。: \<fileName>_\<moduleName>.svg

![saveHCPCharts](hcpworks/resources/videos/saveHCPCharts.gif)

### シンタックスハイライト

以下の画像に示すようにシンタックスハイライトをサポートしています。

![syntaxHighlight](hcpworks/resources/images/syntaxHighlight.png)

## 既知の問題

既知の問題はありません。
問題を発見した場合は、[Github issue](https://github.com/in0ho1no/HCPWorks/issues) にご報告ください。

## リリースノート

[CHANGELOG](hcpworks/CHANGELOG.md) をご確認ください。
