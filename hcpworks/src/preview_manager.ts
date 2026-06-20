import * as vscode from 'vscode';
import { SvgContent } from './svg_content';

/**
 * プレビュー表示を管理する
 */
export class PreviewManager {
  private previewPanel: vscode.WebviewPanel | undefined;

  /** エクスポート要求に対する応答を待つPromiseの解決関数を保持する */
  private pendingExports = new Map<string, {
    resolve: (dataUrl: string) => void;
    reject: (reason: Error) => void;
  }>();

  /** エクスポート要求を一意に識別するための連番 */
  private exportRequestSeq = 0;

  /** エクスポート応答待ちのタイムアウト時間(ミリ秒) */
  private static readonly EXPORT_TIMEOUT_MS = 10000;

  /**
   * プレビューパネルを取得する
   */
  public getPreviewPanel(): vscode.WebviewPanel | undefined {
    return this.previewPanel;
  }

  /**
   * プレビューを画像としてエクスポートする
   *
   * Webviewへエクスポート要求を送り、ラスタライズ結果のdata URLを受け取る。
   *
   * @param format - エクスポート形式
   * @returns 画像のdata URL文字列を解決するPromise
   */
  public exportImage(format: 'png' | 'jpeg' | 'webp'): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!this.previewPanel) {
        reject(new Error('No preview panel available to export.'));
        return;
      }

      const requestId = `export-${this.exportRequestSeq++}`;

      // タイムアウトを設定し、応答が無い場合はrejectする
      const timeout = setTimeout(() => {
        if (this.pendingExports.delete(requestId)) {
          reject(new Error('Image export timed out.'));
        }
      }, PreviewManager.EXPORT_TIMEOUT_MS);

      this.pendingExports.set(requestId, {
        resolve: (dataUrl: string) => {
          clearTimeout(timeout);
          resolve(dataUrl);
        },
        reject: (reason: Error) => {
          clearTimeout(timeout);
          reject(reason);
        },
      });

      this.previewPanel.webview.postMessage({ command: 'exportImage', format, requestId });
    });
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
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },  // 表示位置とフォーカス制御
      {
        enableScripts: true,  // スクリプトを有効化
        retainContextWhenHidden: true,  // 非表示時にコンテキストを保持
      }
    );

    // Webviewからのエクスポート応答を受け取る
    panel.webview.onDidReceiveMessage((message) => {
      if (message?.command !== 'exportImageResult') {
        return;
      }

      const pending = this.pendingExports.get(message.requestId);
      if (!pending) {
        return;
      }
      this.pendingExports.delete(message.requestId);

      if (message.error) {
        pending.reject(new Error(message.error));
      } else {
        pending.resolve(message.dataUrl);
      }
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

      // 応答待ちのエクスポート要求があればすべてrejectする
      for (const pending of this.pendingExports.values()) {
        pending.reject(new Error('Preview panel was closed before export completed.'));
      }
      this.pendingExports.clear();
    });

    return panel;
  }
}
