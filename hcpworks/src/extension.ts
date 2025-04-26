import * as vscode from 'vscode';
import * as fs from 'fs';

import { ModuleTreeProvider } from './tree_provider';
import { ModuleTreeElement } from './tree_element';

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

let previewPanel: vscode.WebviewPanel | undefined;
let selectedItem: ModuleTreeElement | undefined;
let currentSvgContent: SvgContent | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('"hcpworks" is now active!');

  // ツリービューの初期化
  const moduleTreeProvider = new ModuleTreeProvider();
  const moduleTreeView = vscode.window.createTreeView('hcpworks-View', { treeDataProvider: moduleTreeProvider });

  // コマンド登録
  registerCommands(context, moduleTreeProvider);

  // ファイル表示時のイベント登録
  registerFileOpenEvent(context);

  // エディタ切り替え時のイベント登録
  registerEditorChangeEvent(context);

  // ファイル保存時のイベントを登録
  registerFileSaveEvent(context, moduleTreeProvider);

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
      const fileFullPath = editor.document.fileName;
      const fileExtension = fileFullPath.split('.').pop()?.toLowerCase();
      if (fileExtension !== HCP_ID) {
        vscode.window.showInformationMessage(`Current file is not ${HCP_ID.toUpperCase()} file`);
        return;
      }

      // ファイルの内容を取得
      const fileContent = editor.document.getText().replace(/\r\n/g, '\n');
      moduleTreeProvider.updateRootElements(fileFullPath, fileContent);
      moduleTreeProvider.refresh();
    }),

    vscode.commands.registerCommand('hcpworks.itemClicked', (item: ModuleTreeElement) => {
      if (!previewPanel) {
        previewPanel = createWebviewPanel();
      }

      selectedItem = item;
      currentSvgContent = createSvgContent(item);
      previewPanel.webview.html = currentSvgContent.getHtmlWrappedSvg();
    }),

    vscode.commands.registerCommand('hcpworks.savePreview', () => {
      if (!previewPanel) {
        vscode.window.showInformationMessage('No preview panel available to save.');
        return;
      }
      if (!selectedItem) {
        vscode.window.showInformationMessage('No Module selected to save.');
        return;
      }
      if (!currentSvgContent) {
        vscode.window.showInformationMessage('No Svg Content to save.');
        return;
      }

      const savePath = selectedItem.filePath.split('.')[0] + '_' + currentSvgContent.getName() + '.svg';
      const svgContent = currentSvgContent.getSvgContent();

      // ファイルに保存
      fs.writeFile(savePath, svgContent, (err) => {
        if (err) {
          vscode.window.showErrorMessage(`Failed to save preview: ${err.message}`);
        } else {
          vscode.window.showInformationMessage(`Preview saved to ${savePath}`);
        }
      });
    })
  );
}

/**
 * Webviewパネルを作成する
 */
function createWebviewPanel(): vscode.WebviewPanel {
  // Webviewパネルを作成
  const panel = vscode.window.createWebviewPanel(
    'hcpPreview',  // 識別子
    'HCP Preview', // タイトル
    vscode.ViewColumn.Beside,  // 表示位置
    {
      enableScripts: true,  // スクリプトを有効化
      retainContextWhenHidden: true,  // 非表示時にコンテキストを保持
    }
  );

  // カスタムコンテキストキーを設定
  vscode.commands.executeCommand('setContext', 'hcpworks.webviewActive', true);

  // パネルが閉じられたときにコンテキストキーをリセット
  panel.onDidDispose(() => {
    vscode.commands.executeCommand('setContext', 'hcpworks.webviewActive', false);
    previewPanel = undefined;
    selectedItem = undefined;
    currentSvgContent = undefined;
  });

  return panel;
}

/**
 * SVGコンテンツを生成する
 */
function createSvgContent(selectedElement: ModuleTreeElement): SvgContent {
  // コンテンツを新規作成
  const svgContent = new SvgContent()
    .setName(selectedElement.name)
    .setTextContent(cleanTextLines(selectedElement.content));

  // テキストファイルをパース
  const lineInfoList: LineInfo[] = [];
  for (const textContent of svgContent.getTextContent()) {
    const lineInfo = new LineInfo()
      .setTextOrg(textContent)
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
 * ファイル保存時のイベントを登録する
 */
function registerFileSaveEvent(context: vscode.ExtensionContext, moduleTreeProvider: ModuleTreeProvider) {
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      // .hcp ファイルのみを対象とする
      if (document.languageId === HCP_ID || document.fileName.endsWith(HCP_SUFFIX)) {
        const fileFullPath = document.fileName;
        const fileContent = document.getText().replace(/\r\n/g, '\n');

        // プレビューを更新
        moduleTreeProvider.updateRootElements(fileFullPath, fileContent);
        moduleTreeProvider.refresh();

        // Webview パネルが存在する場合は SVG コンテンツを更新
        if (previewPanel && selectedItem) {
          const rootElements = moduleTreeProvider.getRootElements();
          for (const element of rootElements) {
            if (element.name === selectedItem.name) {
              currentSvgContent = createSvgContent(element);
              previewPanel.webview.html = currentSvgContent.getHtmlWrappedSvg();
            }
          }
        }
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
