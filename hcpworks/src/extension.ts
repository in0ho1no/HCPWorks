import * as vscode from 'vscode';
import { ModuleTreeProvider } from './tree_provider';
import { SvgContent } from './svg_content';
import { cleanTextLines } from './parse/file_parse';
import { LineInfo } from './parse/line_info';
import { ProcessLineProcessor } from './parse/line_info_list_process';
import { DataLineProcessor } from './parse/line_info_list_data';
import { ParseInfo4Render } from './parse/parse_info_4_render';
import { SVGRenderer } from './render/render_main';

const TIMEOUT = 300;
const HCP_ID = "hcp";
const HCP_SUFFIX = `.${HCP_ID}`;

export function activate(context: vscode.ExtensionContext) {
  console.log('"hcpworks" is now active!');

  // Webviewパネルの初期化
  let previewPanel: vscode.WebviewPanel | undefined;

  // ツリービューの初期化
  const moduleTreeProvider = new ModuleTreeProvider();
  const moduleTreeView = vscode.window.createTreeView('hcpworks-View', { treeDataProvider: moduleTreeProvider });

  // コマンド登録
  registerCommands(context, moduleTreeProvider);

  // ファイル選択時のイベント登録
  registerFileSelectEvent(moduleTreeView, previewPanel);

  // ファイル表示時のイベント登録
  registerFileOpenEvent(context);

  // エディタ切り替え時のイベント登録
  registerEditorChangeEvent(context);

  // 起動時のチェック処理
  checkActiveEditorOnStartup();
}

export function deactivate() { }

/**
 * コマンドを登録する
 */
function registerCommands(
  context: vscode.ExtensionContext,
  moduleTreeProvider: ModuleTreeProvider
) {
  // モジュール一覧表示コマンド
  context.subscriptions.push(
    vscode.commands.registerCommand('hcpworks.listingModule', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found');
        return;
      }

      // 拡張子判定
      const fileName = editor.document.fileName;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      if (fileExtension !== HCP_ID) {
        vscode.window.showInformationMessage(`Current file is not ${HCP_ID.toUpperCase()} file`);
        return;
      }

      // ファイルの内容を取得
      const fileContent = editor.document.getText();
      moduleTreeProvider.updateRootElements(fileContent);
      moduleTreeProvider.refresh();
    })
  );
}

/**
 * ファイル選択時のイベントを登録する
 */
function registerFileSelectEvent(
  moduleTreeView: vscode.TreeView<any>,
  previewPanel: vscode.WebviewPanel | undefined
) {
  moduleTreeView.onDidChangeSelection((e) => {
    const selectedItem = e.selection[0];
    if (selectedItem) {
      // vscode.window.showInformationMessage(`Selected Module: ${selectedItem.name}`);
      if (!previewPanel) {
        previewPanel = createWebviewPanel();
        previewPanel.onDidDispose(() => {
          previewPanel = undefined;
        });
      }

      const svgContent = createSvgContent(selectedItem);
      previewPanel.webview.html = svgContent.getHtmlWrappedSvg();
    }
  });
}

/**
 * Webviewパネルを作成する
 */
function createWebviewPanel(): vscode.WebviewPanel {
  return vscode.window.createWebviewPanel(
    'hcpPreview',  // 識別子
    'HCP Preview', // タイトル
    vscode.ViewColumn.Beside,  // 表示位置
    {
      enableScripts: true,  // スクリプトを有効化
      retainContextWhenHidden: true,  // 非表示時にコンテキストを保持
    }
  );
}

/**
 * SVGコンテンツを生成する
 */
function createSvgContent(selectedItem: any): SvgContent {
  // コンテンツを新規作成
  const svgContent = new SvgContent()
    .setName(selectedItem.name)
    .setTextContent(cleanTextLines(selectedItem.content));

  // テキストファイルをパース
  const lineInfoList: LineInfo[] = [];
  for (const getText of svgContent.getTextContent()) {
    const lineInfo = new LineInfo()
      .setTextOrg(getText)
      .updateLevel()
      .updateType()
      .updateLineIO();
    lineInfoList.push(lineInfo);
  }

  // 処理部とデータ部の情報に分けて保持
  const processInfoList = ProcessLineProcessor.process(lineInfoList);
  const dataInfoList = DataLineProcessor.process(lineInfoList);

  // レンダリング向けの情報を用意
  const parseInfo4Render = new ParseInfo4Render(processInfoList, dataInfoList);
  parseInfo4Render.mergeIoData();

  // レンダリング実行
  const renderer = new SVGRenderer(svgContent.getName(), parseInfo4Render);
  const svgText = renderer.render();

  return svgContent.setSvgContent(svgText);
}

/**
 * ファイル表示時のイベントを登録する
 */
function registerFileOpenEvent(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((e) => {
      setTimeout(() => {
        if (e.languageId === HCP_ID || e.fileName.endsWith(HCP_SUFFIX)) {
          vscode.commands.executeCommand('hcpworks.listingModule');
        }
      }, TIMEOUT);    // イベント発生直後は状態が完全でないため、一定時間待機する
    })
  );
}

/**
 * エディタ切り替え時のイベントを登録する
 */
function registerEditorChangeEvent(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((e) => {
      if (e && (e.document.languageId === HCP_ID || e.document.fileName.endsWith(HCP_SUFFIX))) {
        vscode.commands.executeCommand('hcpworks.listingModule');
      }
    })
  );
}

/**
 * 起動時にアクティブなエディタをチェックする
 */
function checkActiveEditorOnStartup() {
  const editor = vscode.window.activeTextEditor;
  if (editor && (editor.document.languageId === HCP_ID || editor.document.fileName.endsWith(HCP_SUFFIX))) {
    vscode.commands.executeCommand('hcpworks.listingModule');
  }
}
