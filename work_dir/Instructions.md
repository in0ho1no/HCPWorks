# HCPWorks

本ファイルは開発用の手順書である。

## 初回準備

### 前提

WSL2 + docker環境は構築済みであること

### VSCode上で有効にしておく拡張機能

Dockerコンテナ上の環境で作業するために必要となる拡張機能を有効化しておく。  
.vscodeフォルダに記載してあるので、@recommended から有効化する。

### docker起動

予めDockerのサービスを起動しておく。  
WSL2の起動に合わせることも出来る。  

    sudo service docker start

以下に実行権限を与えることで、Dockerサービスの起動とWorkSpaceの起動を同時に行う。  

    exec.sh

### コンテナの起動

#### workspaceをコンテナ上で開き直す。

コマンドパレットより以下を選択する。  

    Reopen in Container（コンテナーで再度開く）

※ この操作は初回時だけでなく、二度目以降も起動する際に必要となる操作。  

#### DockerImageのビルド

DockerImageが存在しないときに必要となる手順。  
「コンテナで再度開く」を選択後にメニューが続くので以下を選ぶ。  

    From 'Dockerfile' (DockerFileから)」となる

オプションで追加する環境を問われるが、何も選択せずにOKを押せば次に進む。  

ビルド成功後、コンテナに接続するとVSCodeが開き直す。  

### コンテナ環境の確認

以下コマンドでnode.jsとnpmのバージョンを確認しておく。  
以下は2025/03/23時点の実行結果  

```
$ node -v
v22.14.0
$ npm -v
11.2.0
$
```

### プロジェクト作成

プロジェクトのテンプレとなる環境を作成する

    yo code

選択肢は以下とした。

    ? What type of extension do you want to create? New Extension (TypeScript)
    ? What's the name of your extension? HCPWorks
    ? What's the identifier of your extension? hcpworks
    ? What's the description of your extension? This extension displays HCP chart.
    ? Initialize a git repository? No
    ? Which bundler to use? webpack
    ? Which package manager to use? npm

## Githubからcloneしてきた場合の手順

1. exec.shを実行する  
    - dockerのサービス起動
    - VSCodeのworkspace起動
1. VSCodeの拡張機能を利用してworkspaceをコンテナ上で開き直す  
    - dockerfileからDockerImageのビルド
1. npm iコマンドを実行する
    - package.jsonに記載の依存パッケージダウンロード

## 挙動確認

コンテナ上でworkspaceを表示出来たら、動作確認する。

以下拡張機能を有効化しておく。

    amodio.tsl-problem-matcher

F5もしくはデバッグタブから、Run Extensionを実行する

専用のVSCodeが起動したらコマンドパレット(ctrl+shift+P)にて、"Hello World"と入力

ウィンドウ右下に以下表示さればOK

    Hello World from HCPLens!
