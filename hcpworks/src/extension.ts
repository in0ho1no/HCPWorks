import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Encoding from 'encoding-japanese';

import { ModuleTreeProvider } from './tree_provider';
import { ModuleTreeElement } from './tree_element';

import { NumberInputViewProvider } from './webview_settings';

import { SvgContent } from './svg_content';
import { cleanTextLines } from './parse/file_parse';
import { LineInfo } from './parse/line_info';
import { ProcessLineProcessor } from './parse/line_info_list_process';
import { DataLineProcessor } from './parse/line_info_list_data';
import { ParseInfo4Render } from './parse/parse_info_4_render';
import { DiagramDefine } from './render/render_define';
import { SVGRenderer } from './render/render_main';

const TIMEOUT = 300;
const HCP_ID = "hcp";
const HCP_SUFFIX = `.${HCP_ID}`;

let previewPanel: vscode.WebviewPanel | undefined;
let selectedItem: ModuleTreeElement | undefined;
let currentSvgContent: SvgContent | undefined;
let configedLevelLimit: number = 0;

export function activate(context: vscode.ExtensionContext) {
  console.log('"hcpworks" is now active!');

  // ツリービューの初期化
  const moduleTreeProvider = new ModuleTreeProvider();
  const moduleTreeView = vscode.window.createTreeView('hcpworks-View', { treeDataProvider: moduleTreeProvider });

  // wevviewの初期化
  const numberInputViewProviderer = new NumberInputViewProvider(context.extensionUri);

  // コマンド登録
  registerCommands(context, moduleTreeProvider, numberInputViewProviderer);

  // viewを登録
  registerWebview(context, numberInputViewProviderer);

  // ファイル表示時のイベント登録
  registerFileOpenEvent(context);

  // エディタ切り替え時のイベント登録
  registerEditorChangeEvent(context);

  // ファイル保存時のイベントを登録
  registerFileSaveEvent(context, moduleTreeProvider);

  // 設定更新時のイベントを登録
  registerUpdateConfig(context, moduleTreeProvider);

  // 起動時のチェック処理
  checkOnStartup(numberInputViewProviderer);
}

export function deactivate() {
  // リソースのクリーンアップ
  if (previewPanel) {
    previewPanel.dispose();
    previewPanel = undefined;
  }
  selectedItem = undefined;
  currentSvgContent = undefined;
}

/**
 * コマンドを登録する
 */
function registerCommands(
  context: vscode.ExtensionContext,
  moduleTreeProvider: ModuleTreeProvider,
  numberInputViewProviderer: NumberInputViewProvider,
) {
  // モジュール一覧表示コマンド
  context.subscriptions.push(
    vscode.commands.registerCommand('hcpworks.listingModule', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
      }

      // 拡張子判定
      const fileFullPath = editor.document.fileName;
      const fileExtension = fileFullPath.split('.').pop()?.toLowerCase();
      if (fileExtension !== HCP_ID) {
        vscode.window.showWarningMessage(`Current file is not ${HCP_ID.toUpperCase()} file`);
        return;
      }

      // モジュールツリーを更新する
      const filePath = editor.document.uri.fsPath;
      updateModuleTreeProvider(filePath, moduleTreeProvider);
    }),

    vscode.commands.registerCommand('hcpworks.itemClicked', (item: ModuleTreeElement) => {
      // プレビューを表示する
      selectedItem = item;
      updatePreviewByElement(item);
    }),

    vscode.commands.registerCommand('hcpworks.refreshPreview', (item: ModuleTreeElement) => {
      if (selectedItem) {
        const rootElements = moduleTreeProvider.getRootElements();
        for (const element of rootElements) {
          if (element.name === selectedItem.name) {

            // モジュールツリーを更新する
            const filePath = selectedItem.filePath;
            updateModuleTreeProvider(filePath, moduleTreeProvider);

            // SVG コンテンツを更新
            updatePreviewByTree(moduleTreeProvider);
          }
        }
      }
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
    }),

    vscode.commands.registerCommand('hcpworks.configLevelLimit', () => {
      const levelLimit = numberInputViewProviderer.getLevelLimit();
      if (levelLimit !== configedLevelLimit) {
        configedLevelLimit = numberInputViewProviderer.getLevelLimit();
        console.log(`Level Limit: ${configedLevelLimit}`);
        updatePreviewByTree(moduleTreeProvider);
      }
    }),

  );
}

/**
 * viewを登録する
 */
function registerWebview(
  context: vscode.ExtensionContext,
  numberInputViewProviderer: NumberInputViewProvider
) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('hcpworks-numberInputView', numberInputViewProviderer)
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

  // パネルのアクティブ状態が変化するごとにコンテキストの状態更新
  panel.onDidChangeViewState(() => {
    const isActive = panel.active;
    vscode.commands.executeCommand('setContext', 'hcpworks.webviewActive', isActive);
  });

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
  renderer.setSvgColor(getSvgBgColor());
  renderer.setSvgLevelLimit(configedLevelLimit);
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
        // モジュールツリーを更新する
        const filePath = document.uri.fsPath;
        updateModuleTreeProvider(filePath, moduleTreeProvider);

        // プレビューを更新
        updatePreviewByTree(moduleTreeProvider);
      }
    })
  );
}

/**
 * 設定変更を監視して値を更新する
 * @param context 拡張機能のコンテキスト
 */
function registerUpdateConfig(context: vscode.ExtensionContext, moduleTreeProvider: ModuleTreeProvider) {
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {

      // hcpworks.SvgBgColorの更新
      if (event.affectsConfiguration('hcpworks.SvgBgColor')) {
        updatePreviewByTree(moduleTreeProvider);
      }

    })
  );
}

/**
 * 起動時の更新処理
 */
function checkOnStartup(
  numberInputViewProviderer: NumberInputViewProvider,
) {
  // 初期値を取得
  configedLevelLimit = numberInputViewProviderer.getLevelLimit();

  // 起動時にhcpファイルが開いている場合はモジュールツリーを更新
  const editor = vscode.window.activeTextEditor;
  if (editor && (editor.document.languageId === HCP_ID || editor.document.fileName.endsWith(HCP_SUFFIX))) {
    vscode.commands.executeCommand('hcpworks.listingModule');
  }
}

/**
 * ファイルの内容に基づいてモジュールツリーを更新する
 * 
 * @param filePath - ファイルパス
 * @param moduleTreeProvider - モジュールツリープロバイダ
 */
function updateModuleTreeProvider(filePath: string, moduleTreeProvider: ModuleTreeProvider) {
  const fileContent = convertFileContent(filePath);
  moduleTreeProvider.updateRootElements(filePath, fileContent);
  moduleTreeProvider.refresh();
}

/**
 * プレビューを更新する
 */
function updatePreviewByTree(moduleTreeProvider: ModuleTreeProvider): void {
  // Webview パネルが存在する場合は SVG コンテンツを更新
  if (previewPanel && selectedItem) {
    const rootElements = moduleTreeProvider.getRootElements();
    for (const element of rootElements) {
      if (element.name === selectedItem.name) {
        updatePreviewByElement(element);
      }
    }
  }
}

/**
 * モジュールツリー要素に基づいてプレビューを更新する
 * 
 * @param moduleTreeElement - モジュールツリー要素
 */
function updatePreviewByElement(moduleTreeElement: ModuleTreeElement) {
  // Webview パネルが存在しない場合は新規作成
  if (!previewPanel) {
    previewPanel = createWebviewPanel();
  }

  // SVG コンテンツを生成してパネルに設定する
  currentSvgContent = createSvgContent(moduleTreeElement);
  previewPanel.webview.html = currentSvgContent.getHtmlWrappedSvg();
}

/**
 * ファイルをUTF-8で読み込む
 * 
 * 生データを取得するためにファイルパスから直接読み出す
 * 
 * @param filePath - ファイルパス
 * @returns - UTF-8に変換された文字列
 */
function convertFileContent(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);

  // 文字コードを自動検出
  const detectedEncoding = Encoding.detect(fileBuffer);
  const encodingToUse = detectedEncoding && detectedEncoding !== 'BINARY' ? detectedEncoding : 'SJIS';

  // 文字コード変換
  const unicodeArray = Encoding.convert(fileBuffer, {
    to: 'UNICODE',
    from: encodingToUse,
    type: 'array'
  });

  // UnicodeArrayを文字列に変換
  const decodedContent = Encoding.codeToString(unicodeArray);

  // 改行コードを統一
  const unifiedContent = decodedContent.replace(/\r\n/g, '\n');
  return unifiedContent;
}

/**
 * Previewの背景色を取得する
 * @returns 背景色
 */
function getSvgBgColor(): string {
  const configKey = "hcpworks.SvgBgColor";
  const rawSvgBgColor = vscode.workspace.getConfiguration().get<string>(configKey, DiagramDefine.DEFAULT_BG_COLOR);

  // #を除外
  const defaultColorValue = DiagramDefine.DEFAULT_BG_COLOR.replace("#", "");
  const userColorValue = rawSvgBgColor.replace("#", "");

  // 16進文字列チェック（0-9、A-F、a-fのみを許可）
  const hexRegex = /^[0-9A-Fa-f]+$/;
  if (!hexRegex.test(userColorValue)) {
    vscode.window.showErrorMessage(`${configKey}: 16進数（0-9、A-F）で指定してください。現在の値: ${rawSvgBgColor}`);
    return defaultColorValue;
  }

  // 文字列長チェック
  const colorLength = defaultColorValue.length;
  if (userColorValue.length !== colorLength) {
    vscode.window.showErrorMessage(`${configKey}: ${colorLength}文字の16進数で指定してください。現在の値: ${rawSvgBgColor}`);
    return defaultColorValue;
  }

  return userColorValue;
}
