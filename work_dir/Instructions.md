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

    Hello World from HCPWorks!

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

### 実装側

とにかく必要なのは、TreeDataProviderである。  
このproviderには、必須APIが存在する。

- getChildren(element?: T): ProviderResult<T[]>
- getTreeItem(element: T): TreeItem | Thenable<TreeItem>

この2つのAPIを実装するためには、elementも必要となる。

よって、以下手順で作業することになる。

1. elementクラスの作成
2. vscode.TreeDataProviderの実装
    1. getTreeItemの実装
    2. getChildrenの実装
3. 作成したproviderを登録してVSCodeさんが呼び出せるようにする

#### TreeDataProviderについて

[Tree view API](https://code.visualstudio.com/api/extension-guides/tree-view)

前述の手順で登録したビューにデータを提供して、VSCodeがデータを表示できるようにする。

まずTreeDataProviderの実装が必要。これには、2つの必須メソッドが存在する。

- getChildren(element?: T): ProviderResult<T[]>  
  Implement this to return the children for the given element or root (if no element is passed).  
  指定された要素の子、もしくはルートの子を取得するのに必要。
- getTreeItem(element: T): TreeItem | Thenable<TreeItem>  
  Implement this to return the UI representation (TreeItem) of the element that gets displayed in the view.  
  ビューに表示される要素のUI表現を取得するのに必要。

ユーザがツリービューを開いたとき、要素無しでgetChildrenが呼ばれる。つまり、ルート要素を要求されることになる。

### providerの登録

[Registering the TreeDataProvider](https://code.visualstudio.com/api/extension-guides/tree-view#registering-the-treedataprovider)

手段は2つある模様

- vscode.window.registerTreeDataProvider: package.jsonで登録済みのIDと実装したproviderを登録する
- vscode.window.createTreeView:  package.jsonで登録済みのIDと実装したproviderでtree viewを作成する。TreeViewAPIが必要な場合はこちらを使用する。

サンプルで動かす程度ならregisterTreeDataProviderで問題なさそう。動作確認を済ませて柔軟な実装をしようと思ったらcreateTreeViewを使った方がいい。

#### treeviewの要素選択

treeview上に表示した要素をクリックしたときのイベントは以下用意する。

まずイベント検出用にpackage.jsonへ以下登録する。

  "activationEvents": [
    "onLanguage:hcp"
  ],

そして以下3種用意して、確実にhcpファイルの表示を検知する

- onDidOpenTextDocument: 新規でパネルを開いたことを検知するイベント
- onDidChangeActiveTextEditor: エディタ(タブ)を切り替えたことを検知するイベント
- if (vscode.window.activeTextEditor) {} : 起動時のアクティブエディタからhcpファイルを検知する

## テスト環境の整備

テストコードを以下に追加しておく。

  /workspaces/HCPWorks/hcpworks/src/test/file_parse.test.ts

github actionsでユニットテストを実行するためのworkflowを追加しておく。

  /workspaces/HCPWorks/.github/workflows/test.yml

github actions上で結果を確認しやすいようにする。  
※ package.jsonへ追記しておけばci的に環境構築できるので、dockerfileへ追記する必要はない。  

  npm install --save-dev mocha-github-actions-reporter

github actions上で結果を確認しやすいようにする。  
※ package.jsonへ追記しておけばci的に環境構築できるので、dockerfileへ追記する必要はない。  

  npm install --save-dev mocha-junit-reporter

テスト結果をxml出力するように設定しておく

  .vscode-test.mjs

結果ページを開いたJobsにMocha Testsと表示される。  
ページを開くと実行結果を視覚的に確認できる。
