import * as vscode from 'vscode';
import { SvgContent } from './svg_content';

/**
 * プレビュー表示を管理する
 */
export class PreviewManager {
  private previewPanel: vscode.WebviewPanel | undefined;

  /**
   * プレビューパネルを取得する
   */
  public getPreviewPanel(): vscode.WebviewPanel | undefined {
    return this.previewPanel;
  }

  /**
   * プレビューを更新する
   */
  public updatePreview(svgContent: SvgContent): void {
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
  private createWebviewPanel(): vscode.WebviewPanel {
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
      this.previewPanel = undefined;
    });

    return panel;
  }
}
