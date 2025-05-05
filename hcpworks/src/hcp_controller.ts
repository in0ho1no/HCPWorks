import * as vscode from 'vscode';

import { ModuleTreeProvider } from './provider/tree_provider';
import { ModuleTreeElement } from './provider/tree_element';
import { NumberInputViewProvider } from './provider/webview_settings';

import { SvgContent } from './svg_content';
import { PreviewManager } from './preview_manager';

import { ConfigManager } from './utils/config_manager';
import { FileManager } from './utils/file_manager';

import { ParseInfo4Render } from './parse/parse_info_4_render';
import { ProcessLineProcessor } from './parse/line_info_list_process';
import { DataLineProcessor } from './parse/line_info_list_data';
import { LineInfo } from './parse/line_info';
import { cleanTextLines } from './parse/file_parse';
import { SVGRenderer } from './render/render_main';

import { HCP_ID, HCP_SUFFIX, TIMEOUT } from './extension';

/**
 * アプリケーション全体を制御するコントローラ
 */
export class HCPController {
  private context: vscode.ExtensionContext;

  private moduleTreeProvider: ModuleTreeProvider;
  private numberInputViewProvider: NumberInputViewProvider;

  private previewManager: PreviewManager;
  private configManager: ConfigManager;
  private fileManager: FileManager;

  private selectedItem: ModuleTreeElement | undefined;
  private currentSvgContent: SvgContent | undefined;
  private configedLevelLimit: number = 0;

  constructor(
    context: vscode.ExtensionContext,
    configManager: ConfigManager,
    fileManager: FileManager
  ) {
    this.context = context;
    this.configManager = configManager;
    this.fileManager = fileManager;

    // 初期化
    this.moduleTreeProvider = new ModuleTreeProvider();
    this.numberInputViewProvider = new NumberInputViewProvider(context.extensionUri);
    this.previewManager = new PreviewManager();
  }

  /**
   * 拡張機能の初期化
   */
  public initialize(): void {
    // ツリービューの初期化
    const moduleTreeView = vscode.window.createTreeView('hcpworks-View', {
      treeDataProvider: this.moduleTreeProvider
    });

    // コマンド登録
    this.registerCommands();

    // viewを登録
    this.registerWebview();

    // イベント登録
    this.registerEvents();

    // 起動時のチェック処理
    this.checkOnStartup();
  }

  /**
   * コマンドを登録する
   */
  private registerCommands(): void {
    // モジュール一覧表示コマンド
    this.context.subscriptions.push(
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
        this.updateModuleTreeProvider(filePath);
      }),

      vscode.commands.registerCommand('hcpworks.itemClicked', (item: ModuleTreeElement) => {
        // プレビューを表示する
        this.selectedItem = item;
        this.updatePreviewByElement(item);
      }),

      vscode.commands.registerCommand('hcpworks.refreshPreview', () => {
        if (this.selectedItem) {
          const rootElements = this.moduleTreeProvider.getRootElements();
          for (const element of rootElements) {
            if (element.name === this.selectedItem.name) {
              // モジュールツリーを更新する
              const filePath = this.selectedItem.filePath;
              this.updateModuleTreeProvider(filePath);

              // SVG コンテンツを更新
              this.updatePreviewByTree();
            }
          }
        }
      }),

      vscode.commands.registerCommand('hcpworks.savePreview', () => {
        if (!this.previewManager.getPreviewPanel()) {
          vscode.window.showInformationMessage('No preview panel available to save.');
          return;
        }
        if (!this.selectedItem) {
          vscode.window.showInformationMessage('No Module selected to save.');
          return;
        }
        if (!this.currentSvgContent) {
          vscode.window.showInformationMessage('No Svg Content to save.');
          return;
        }

        const savePath = this.selectedItem.filePath.split('.')[0] + '_' +
          this.currentSvgContent.getName() + '.svg';
        const svgContent = this.currentSvgContent.getSvgContent();

        // ファイルに保存
        this.fileManager.saveSvgToFile(savePath, svgContent);
      }),

      vscode.commands.registerCommand('hcpworks.configLevelLimit', () => {
        const levelLimit = this.numberInputViewProvider.getLevelLimit();
        if (levelLimit !== this.configedLevelLimit) {
          this.configedLevelLimit = this.numberInputViewProvider.getLevelLimit();
          console.log(`Level Limit: ${this.configedLevelLimit}`);
          this.updatePreviewByTree();
        }
      }),
    );
  }

  /**
   * viewを登録する
   */
  private registerWebview(): void {
    this.context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        'hcpworks-numberInputView',
        this.numberInputViewProvider
      )
    );
  }

  /**
   * イベントを登録する
   */
  private registerEvents(): void {
    // ファイル表示時のイベント登録
    this.context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument((e) => {
        setTimeout(() => {
          if (e.languageId === HCP_ID || e.fileName.endsWith(HCP_SUFFIX)) {
            vscode.commands.executeCommand('hcpworks.listingModule');
          }
        }, TIMEOUT);    // イベント発生直後は状態が完全でないため、一定時間待機する
      })
    );

    // エディタ切り替え時のイベント登録
    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((e) => {
        if (e && (e.document.languageId === HCP_ID || e.document.fileName.endsWith(HCP_SUFFIX))) {
          vscode.commands.executeCommand('hcpworks.listingModule');
        }
      })
    );

    // ファイル保存時のイベント登録
    this.context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((document) => {
        // .hcp ファイルのみを対象とする
        if (document.languageId === HCP_ID || document.fileName.endsWith(HCP_SUFFIX)) {
          // モジュールツリーを更新する
          const filePath = document.uri.fsPath;
          this.updateModuleTreeProvider(filePath);

          // プレビューを更新
          this.updatePreviewByTree();
        }
      })
    );

    // 設定変更を監視
    this.context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        // hcpworks.SvgBgColorの更新
        if (event.affectsConfiguration('hcpworks.SvgBgColor')) {
          this.updatePreviewByTree();
        }
      })
    );
  }

  /**
   * 起動時の更新処理
   */
  private checkOnStartup(): void {
    // 初期値を取得
    this.configedLevelLimit = this.numberInputViewProvider.getLevelLimit();

    // 起動時にhcpファイルが開いている場合はモジュールツリーを更新
    const editor = vscode.window.activeTextEditor;
    if (editor && (editor.document.languageId === HCP_ID || editor.document.fileName.endsWith(HCP_SUFFIX))) {
      vscode.commands.executeCommand('hcpworks.listingModule');
    }
  }

  /**
   * ファイルの内容に基づいてモジュールツリーを更新する
   */
  private updateModuleTreeProvider(filePath: string): void {
    const fileContent = this.fileManager.convertFileContent(filePath);
    this.moduleTreeProvider.updateRootElements(filePath, fileContent);
    this.moduleTreeProvider.refresh();
  }

  /**
   * SVGコンテンツを生成する
   */
  private createSvgContent(selectedElement: ModuleTreeElement): SvgContent {
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
    const processInfoList = ProcessLineProcessor.process(lineInfoList, this.configedLevelLimit);
    const dataInfoList = DataLineProcessor.process(lineInfoList);

    // レンダリング向けの情報を用意
    const parseInfo4Render = new ParseInfo4Render(processInfoList, dataInfoList);
    parseInfo4Render.mergeIoData();

    // レンダリング実行
    const renderer = new SVGRenderer(svgContent.getName(), parseInfo4Render);
    renderer.setSvgBgColor(this.configManager.getConfigSvgBgColor());
    const svgText = renderer.render();

    return svgContent.setSvgContent(svgText);
  }

  /**
   * プレビューを更新する
   */
  private updatePreviewByTree(): void {
    // Webview パネルが存在する場合は SVG コンテンツを更新
    if (this.previewManager.getPreviewPanel() && this.selectedItem) {
      const rootElements = this.moduleTreeProvider.getRootElements();
      for (const element of rootElements) {
        if (element.name === this.selectedItem.name) {
          this.updatePreviewByElement(element);
        }
      }
    }
  }

  /**
   * モジュールツリー要素に基づいてプレビューを更新する
   */
  private updatePreviewByElement(moduleTreeElement: ModuleTreeElement): void {
    // SVG コンテンツを生成
    this.currentSvgContent = this.createSvgContent(moduleTreeElement);

    // プレビューパネルを取得または作成し、コンテンツを設定
    this.previewManager.updatePreview(this.currentSvgContent);
  }
}
