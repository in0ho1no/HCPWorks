import * as vscode from 'vscode';

import { SvgContent } from './svg_content';
import { ConfigManager } from './utils/config_manager';
import { FileManager } from './utils/file_manager';
import { PreviewManager } from './preview_manager';

import { ModuleTreeProvider } from './provider/tree_provider';
import { ModuleTreeElement } from './provider/tree_element';
import { NumberInputViewProvider } from './provider/webview_settings';

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
      const fileManager = new FileManager();
      fileManager.saveSvgToFile(savePath, svgContent);
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
  const processInfoList = ProcessLineProcessor.process(lineInfoList, configedLevelLimit);
  const dataInfoList = DataLineProcessor.process(lineInfoList);

  // レンダリング向けの情報を用意
  const parseInfo4Render = new ParseInfo4Render(processInfoList, dataInfoList);
  parseInfo4Render.mergeIoData();

  // レンダリング実行
  const renderer = new SVGRenderer(svgContent.getName(), parseInfo4Render);
  const configManger = new ConfigManager();
  renderer.setSvgBgColor(configManger.getConfigSvgBgColor());
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
  const fileManager = new FileManager();
  const fileContent = fileManager.convertFileContent(filePath);
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
  // SVG コンテンツを生成
  currentSvgContent = createSvgContent(moduleTreeElement);

  // プレビューパネルを取得または作成し、コンテンツを設定
  const previewManager = new PreviewManager();
  previewManager.updatePreview(currentSvgContent);
}
