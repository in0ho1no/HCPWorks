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
exports.PreviewManager = void 0;
const vscode = __importStar(require("vscode"));
/**
 * プレビュー表示を管理する
 */
class PreviewManager {
    previewPanel;
    /**
     * プレビューパネルを取得する
     */
    getPreviewPanel() {
        return this.previewPanel;
    }
    /**
     * プレビューを更新する
     */
    updatePreview(svgContent) {
        // Webview パネルが存在しない場合は新規作成
        if (!this.previewPanel) {
            this.previewPanel = this.createWebviewPanel();
        }
        // HTMLコンテンツを更新
        this.previewPanel.webview.html = svgContent.getHtmlWrappedSvg();
    }
    /**
     * Webviewパネルを作成する
     */
    createWebviewPanel() {
        // Webviewパネルを作成
        const panel = vscode.window.createWebviewPanel('hcpPreview', // 識別子
        'HCP Preview', // タイトル
        vscode.ViewColumn.Beside, // 表示位置
        {
            enableScripts: true, // スクリプトを有効化
            retainContextWhenHidden: true, // 非表示時にコンテキストを保持
        });
        // パネルのアクティブ状態が変化するごとにコンテキストの状態更新
        panel.onDidChangeViewState(() => {
            const isActive = panel.active;
            vscode.commands.executeCommand('setContext', 'hcpworks.webviewActive', isActive);
        });
        // パネルが閉じられたときにコンテキストキーをリセット
        panel.onDidDispose(() => {
            vscode.commands.executeCommand('setContext', 'hcpworks.webviewActive', false);
            this.previewPanel = undefined;
        });
        return panel;
    }
}
exports.PreviewManager = PreviewManager;
//# sourceMappingURL=preview_manager.js.map