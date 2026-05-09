"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HCPController = void 0;
const vscode = __importStar(require("vscode"));
const tree_provider_1 = require("./provider/tree_provider");
const webview_settings_1 = require("./provider/webview_settings");
const svg_content_1 = require("./svg_content");
const preview_manager_1 = require("./preview_manager");
const parse_info_4_render_1 = require("./parse/parse_info_4_render");
const line_info_list_process_1 = require("./parse/line_info_list_process");
const line_info_list_data_1 = require("./parse/line_info_list_data");
const line_info_1 = require("./parse/line_info");
const file_parse_1 = require("./parse/file_parse");
const render_main_1 = require("./render/render_main");
const extension_1 = require("./extension");
/**
 * アプリケーション全体を制御するコントローラ
 */
class HCPController {
    context;
    moduleTreeProvider;
    numberInputViewProvider;
    previewManager;
    configManager;
    fileManager;
    selectedItem;
    currentSvgContent;
    configedLevelLimit = 0;
    constructor(context, configManager, fileManager) {
        this.context = context;
        this.configManager = configManager;
        this.fileManager = fileManager;
        // 初期化
        this.moduleTreeProvider = new tree_provider_1.ModuleTreeProvider();
        this.numberInputViewProvider = new webview_settings_1.NumberInputViewProvider(context.extensionUri);
        this.previewManager = new preview_manager_1.PreviewManager();
    }
    /**
     * 拡張機能の初期化
     */
    initialize() {
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
    registerCommands() {
        // モジュール一覧表示コマンド
        this.context.subscriptions.push(vscode.commands.registerCommand('hcpworks.listingModule', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found');
                return;
            }
            // 拡張子判定
            const fileFullPath = editor.document.fileName;
            const fileExtension = fileFullPath.split('.').pop()?.toLowerCase();
            if (fileExtension !== extension_1.HCP_ID) {
                vscode.window.showWarningMessage(`Current file is not ${extension_1.HCP_ID.toUpperCase()} file`);
                return;
            }
            // モジュールツリーを更新する
            const filePath = editor.document.uri.fsPath;
            this.updateModuleTreeProvider(filePath);
        }), vscode.commands.registerCommand('hcpworks.itemClicked', (item) => {
            // プレビューを表示する
            this.selectedItem = item;
            this.updatePreviewByElement(item);
        }), vscode.commands.registerCommand('hcpworks.refreshPreview', () => {
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
        }), vscode.commands.registerCommand('hcpworks.savePreview', () => {
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
        }), vscode.commands.registerCommand('hcpworks.configLevelLimit', () => {
            const levelLimit = this.numberInputViewProvider.getLevelLimit();
            if (levelLimit !== this.configedLevelLimit) {
                this.configedLevelLimit = this.numberInputViewProvider.getLevelLimit();
                console.log(`Level Limit: ${this.configedLevelLimit}`);
                this.updatePreviewByTree();
            }
        }));
    }
    /**
     * viewを登録する
     */
    registerWebview() {
        this.context.subscriptions.push(vscode.window.registerWebviewViewProvider('hcpworks-numberInputView', this.numberInputViewProvider));
    }
    /**
     * イベントを登録する
     */
    registerEvents() {
        // ファイル表示時のイベント登録
        this.context.subscriptions.push(vscode.workspace.onDidOpenTextDocument((e) => {
            setTimeout(() => {
                if (e.languageId === extension_1.HCP_ID || e.fileName.endsWith(extension_1.HCP_SUFFIX)) {
                    vscode.commands.executeCommand('hcpworks.listingModule');
                }
            }, extension_1.TIMEOUT); // イベント発生直後は状態が完全でないため、一定時間待機する
        }));
        // エディタ切り替え時のイベント登録
        this.context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((e) => {
            if (e && (e.document.languageId === extension_1.HCP_ID || e.document.fileName.endsWith(extension_1.HCP_SUFFIX))) {
                vscode.commands.executeCommand('hcpworks.listingModule');
            }
        }));
        // ファイル保存時のイベント登録
        this.context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((document) => {
            // .hcp ファイルのみを対象とする
            if (document.languageId === extension_1.HCP_ID || document.fileName.endsWith(extension_1.HCP_SUFFIX)) {
                // モジュールツリーを更新する
                const filePath = document.uri.fsPath;
                this.updateModuleTreeProvider(filePath);
                // プレビューを更新
                this.updatePreviewByTree();
            }
        }));
        // 設定変更を監視
        this.context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
            let isUpdatePreview = false;
            if (event.affectsConfiguration('hcpworks.SvgBgColor')) {
                this.updatePreviewByTree();
                isUpdatePreview = true;
            }
            if (event.affectsConfiguration('hcpworks.WireColorTable')) {
                isUpdatePreview = true;
            }
            if (isUpdatePreview) {
                this.updatePreviewByTree();
            }
        }));
    }
    /**
     * 起動時の更新処理
     */
    checkOnStartup() {
        // 初期値を取得
        this.configedLevelLimit = this.numberInputViewProvider.getLevelLimit();
        // 起動時にhcpファイルが開いている場合はモジュールツリーを更新
        const editor = vscode.window.activeTextEditor;
        if (editor && (editor.document.languageId === extension_1.HCP_ID || editor.document.fileName.endsWith(extension_1.HCP_SUFFIX))) {
            vscode.commands.executeCommand('hcpworks.listingModule');
        }
    }
    /**
     * ファイルの内容に基づいてモジュールツリーを更新する
     */
    updateModuleTreeProvider(filePath) {
        const fileContent = this.fileManager.convertFileContent(filePath);
        this.moduleTreeProvider.updateRootElements(filePath, fileContent);
        this.moduleTreeProvider.refresh();
    }
    /**
     * SVGコンテンツを生成する
     */
    createSvgContent(selectedElement) {
        // コンテンツを新規作成
        const svgContent = new svg_content_1.SvgContent()
            .setName(selectedElement.name)
            .setTextContent((0, file_parse_1.cleanTextLines)(selectedElement.content));
        // テキストファイルをパース
        const lineInfoList = [];
        for (const textContent of svgContent.getTextContent()) {
            const lineInfo = new line_info_1.LineInfo()
                .setTextOrg(textContent)
                .updateLevel()
                .updateType()
                .updateLineIO();
            lineInfoList.push(lineInfo);
        }
        // 処理部とデータ部の情報に分けて保持
        const processInfoList = line_info_list_process_1.ProcessLineProcessor.process(lineInfoList, this.configedLevelLimit);
        const dataInfoList = line_info_list_data_1.DataLineProcessor.process(lineInfoList);
        // レンダリング向けの情報を用意
        const parseInfo4Render = new parse_info_4_render_1.ParseInfo4Render(processInfoList, dataInfoList);
        parseInfo4Render.mergeIoData();
        // レンダリング実行
        const renderer = new render_main_1.SVGRenderer(svgContent.getName(), parseInfo4Render)
            .setSvgBgColor(this.configManager.getConfigSvgBgColor())
            .setWireColorTable(this.configManager.getConfigWireColorTable());
        const svgText = renderer.render();
        return svgContent.setSvgContent(svgText);
    }
    /**
     * プレビューを更新する
     */
    updatePreviewByTree() {
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
    updatePreviewByElement(moduleTreeElement) {
        // SVG コンテンツを生成
        this.currentSvgContent = this.createSvgContent(moduleTreeElement);
        // プレビューパネルを取得または作成し、コンテンツを設定
        this.previewManager.updatePreview(this.currentSvgContent);
    }
}
exports.HCPController = HCPController;
//# sourceMappingURL=hcp_controller.js.map