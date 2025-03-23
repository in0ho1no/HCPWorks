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

### 挙動確認

コンテナ上でworkspaceを表示出来たら、動作確認する。

以下拡張機能を有効化しておく。

    amodio.tsl-problem-matcher

F5もしくはデバッグタブから、Run Extensionを実行する

専用のVSCodeが起動したらコマンドパレット(ctrl+shift+P)にて、"Hello World"と入力

ウィンドウ右下に以下表示さればOK

    Hello World from HCPLens!

## 初回に限らない手順

### ビルド手順

1. build.shに実行権限を付与しておく
1. コンテナ上のターミナルで build.shを実行する  
   nodejsのバージョンも関わるので、必ずコンテナ環境のターミナルを利用すること
1. *.vsixファイルが出力される
1. 適当な環境(windows sandbox等)へVSCodeインストールして、vsixファイルから拡張機能をインストール
1. 目的の機能を実行できればOK

### Githubからcloneしてきた場合の手順

1. exec.shを実行する  
    - dockerのサービス起動
    - VSCodeのworkspace起動
1. VSCodeの拡張機能を利用してworkspaceをコンテナ上で開き直す  
    - dockerfileからDockerImageのビルド
1. npm iコマンドを実行する
    - package.jsonに記載の依存パッケージダウンロード

## 写経

[参考](https://qiita.com/Teach/items/3622e159782f2baecaf1)

### views

[views](https://code.visualstudio.com/api/references/contribution-points#contributes.views)

contributes の views 要素にて、アクティビティバーのどこに、どんなサイドバーを表示するのか、定義する。

《アクティビティバーの指定》は以下5種(規定4種+カスタム1種)

- explorer: Explorer view container in the Activity Bar
- scm: Source Control Management (SCM) view container in the Activity Bar
- debug: Run and Debug view container in the Activity Bar
- test: Test view container in the Activity Bar
- Custom view containers contributed by Extensions.

《ID》は contributes の他の要素との紐付けに必要な印象。一意で分かりやすい名前にしておくのが無難

《NAME》はサイドバーへ表示する際のタイトルのようなもの。確実に目にすることになるので、拡張機能として区別しやすい名称がよさそう。自動で大文字表記になる。

《WHEN》は詳細不明。ドキュメントは多分
[ここ](https://code.visualstudio.com/api/references/when-clause-contexts)
にある。
デフォルトのキーも
[存在](https://code.visualstudio.com/api/references/when-clause-contexts)
しそうだが、サンプルに記載された「workspaceHasPackageJSON」は一覧にない。
恐らく、実装側で定義した文字列もキーに指定できるのだと思われる。

《ICON》はアクティビティバーへ表示する際に使用される。
VSCode上ではドラッグアンドドロップでサイドバーの要素を移動できるので、デフォルト要素のexplorerを指定したとしてもカスタム表示が必要になるケースがあるため。
package.jsonの配置されたパスを起点にiconまでのパスを指定する。

後述のviewsContainersで指定するので、この《ICON》指定はなくてもよさそう。ただvscode上で黄色破線がでるので、気持ち悪い人は指定するのもあり。

《CONTEXTUAL TITLE》はアクティビティバーへ表示する際に使用される。自動で大文字表記になる。
iconと同様の理由で必要になる。
そして、iconと同様の理由で不要とも言える。こちらは黄色破線も出ないので、完全にviewsContainersへ依存させる方がよさそう。

```
"contributes": {
・・・
    "views": {
      "《アクティビティバーの指定》": [
        {
          "id": "《ID》",
          "name": "《NAME》"
          "when": "《WHEN》",
          "icon": "《ICON》-filepath",
          "contextualTitle": "《CONTEXTUAL TITLE》"
        }
      ]
    },
}
```

HCPWorks向けに記載する。
viewsContainersも加味して削ると以下になる。
黄色破線が嫌なのでiconは残しつつ、不要になるcontextualTitleは削除した。

```
"contributes": {
・・・
    "views": {
      "hcpworks-container": [
        {
          "id": "hcpworks-View",
          "name": "Module List",
          "icon": "resources/icon/icon.png"
        }
      ]
    }
}
```

この時点では最もラシイ動作確認はできない。
特に《アクティビティバーの指定》をカスタムにしている場合は、エラーになる。  

### viewsContainers

[viewsContainers](https://code.visualstudio.com/api/references/contribution-points#contributes.viewsContainers)

contributes の viewsContainers 要素にて、viewsの親要素的な定義を行う。

《コントリビュート先の指定》は以下2種。panelの詳細は試していないので不明。

- activitybar: 
- panel: 

《ID》はviewsで《アクティビティバーの指定》をカスタムにしている場合、その文字列となる。
要するに、viewsContainersではアクティビティバーの(explorer/scm/debug/testに次ぐ)第5の要素をユーザが定義するようなイメージである。

《TITLE》はviewsにおける《CONTEXTUAL TITLE》と同等だと思われる。

《ICON》はviewsと同じ。

```
"contributes": {
・・・
  "viewsContainers": {
    "《コントリビュート先の指定》": [
      {
        "id": "《ID》",
        "title": "《TITLE》",
        "icon": "《ICON》"
      }
    ]
  },
}
```

HCPWorks向けに記載すると以下のようになる。

```
"contributes": {
・・・
    "viewsContainers": {
      "activitybar": [
        {
          "id": "hcpworks-container",
          "title": "HCP Works",
          "icon": "resources/icon/icon.png"
        }
      ]
    },
}
```
