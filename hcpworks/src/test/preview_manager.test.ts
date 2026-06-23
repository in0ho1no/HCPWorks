import * as assert from 'assert';
import * as vscode from 'vscode';
import { PreviewManager } from '../preview_manager';
import { SvgContent } from '../svg_content';

suite('PreviewManager - focus behavior', () => {
  test('creates preview panel without stealing focus from the editor', () => {
    let capturedShowOptions: vscode.ViewColumn | { readonly viewColumn: vscode.ViewColumn; readonly preserveFocus?: boolean } | undefined;

    (vscode.window as any).createWebviewPanel = (
      _viewType: string,
      _title: string,
      showOptions: vscode.ViewColumn | { readonly viewColumn: vscode.ViewColumn; readonly preserveFocus?: boolean },
      _options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
    ) => {
      capturedShowOptions = showOptions;
      return {
        webview: {
          html: '',
          onDidReceiveMessage: () => ({ dispose: () => undefined }),
          postMessage: () => Promise.resolve(true),
        },
        onDidChangeViewState: () => ({ dispose: () => undefined }),
        onDidDispose: () => ({ dispose: () => undefined }),
        active: false,
      } as unknown as vscode.WebviewPanel;
    };

    const previewManager = new PreviewManager();
    const svgContent = { getHtmlWrappedSvg: () => '<svg></svg>' } as SvgContent;

    previewManager.updatePreview(svgContent);

    assert.ok(capturedShowOptions, 'webview show options should be captured');
    assert.strictEqual(
      typeof capturedShowOptions === 'object' ? capturedShowOptions.preserveFocus : false,
      true
    );
  });
});