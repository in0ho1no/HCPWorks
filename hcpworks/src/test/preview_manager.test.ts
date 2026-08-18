import * as assert from 'assert';
import * as vscode from 'vscode';
import { PreviewManager } from '../preview_manager';
import { SvgContent } from '../svg_content';

/** テスト用の拡張機能ルートURI */
const extensionUri = vscode.Uri.file('/ext');

/**
 * createWebviewPanelを差し替えて生成されるパネルのスタブを返す
 *
 * @returns 捕捉したパネルと表示オプションへの参照
 */
function stubCreateWebviewPanel(): {
  panel: { title: string; iconPath?: vscode.Uri; webview: { html: string } };
  showOptions: () => vscode.ViewColumn | { readonly viewColumn: vscode.ViewColumn; readonly preserveFocus?: boolean } | undefined;
  postedMessages: () => { command?: string }[];
} {
  let capturedShowOptions:
    | vscode.ViewColumn
    | { readonly viewColumn: vscode.ViewColumn; readonly preserveFocus?: boolean }
    | undefined;

  const postedMessages: { command?: string }[] = [];

  const panel = {
    title: '',
    iconPath: undefined as vscode.Uri | undefined,
    webview: {
      html: '',
      onDidReceiveMessage: () => ({ dispose: () => undefined }),
      postMessage: (message: { command?: string }) => {
        postedMessages.push(message);
        return Promise.resolve(true);
      },
    },
    onDidChangeViewState: () => ({ dispose: () => undefined }),
    onDidDispose: () => ({ dispose: () => undefined }),
    active: false,
  };

  (vscode.window as any).createWebviewPanel = (
    _viewType: string,
    title: string,
    showOptions: vscode.ViewColumn | { readonly viewColumn: vscode.ViewColumn; readonly preserveFocus?: boolean },
    _options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
  ) => {
    capturedShowOptions = showOptions;
    panel.title = title;
    return panel as unknown as vscode.WebviewPanel;
  };

  return { panel, showOptions: () => capturedShowOptions, postedMessages: () => postedMessages };
}

/**
 * プレビュー対象のSvgContentスタブを作る
 *
 * @param name - モジュール名
 * @param sourcePath - 変換元ファイルのフルパス
 */
function makeContent(name: string, sourcePath: string): SvgContent {
  return {
    getName: () => name,
    getSourcePath: () => sourcePath,
    getHtmlWrappedSvg: () => '<svg></svg>',
  } as unknown as SvgContent;
}

suite('PreviewManager - focus behavior', () => {
  test('creates preview panel without stealing focus from the editor', () => {
    const { showOptions } = stubCreateWebviewPanel();

    const previewManager = new PreviewManager(extensionUri);
    previewManager.updatePreview(makeContent('module', '/work/sample.hcp'));

    const captured = showOptions();
    assert.ok(captured, 'webview show options should be captured');
    assert.strictEqual(
      typeof captured === 'object' ? captured.preserveFocus : false,
      true
    );
  });
});

suite('PreviewManager - Method - resetView', () => {
  test('should report failure when no preview panel exists yet', () => {
    stubCreateWebviewPanel();

    const previewManager = new PreviewManager(extensionUri);

    assert.strictEqual(previewManager.resetView(), false);
  });

  test('should ask the webview to reset the view', () => {
    const { postedMessages } = stubCreateWebviewPanel();

    const previewManager = new PreviewManager(extensionUri);
    previewManager.updatePreview(makeContent('module', '/work/sample.hcp'));

    assert.strictEqual(previewManager.resetView(), true);
    assert.deepStrictEqual(postedMessages(), [{ command: 'resetView' }]);
  });
});

suite('PreviewManager - tab title and icon', () => {
  test('should set title to "fileName without extension - moduleName"', () => {
    const { panel } = stubCreateWebviewPanel();

    const previewManager = new PreviewManager(extensionUri);
    previewManager.updatePreview(makeContent('有効なデータをチェックする3', '/work/sample/header.hcp'));

    assert.strictEqual(panel.title, 'header - 有効なデータをチェックする3');
  });

  test('should update title when previewing another module', () => {
    const { panel } = stubCreateWebviewPanel();

    const previewManager = new PreviewManager(extensionUri);
    previewManager.updatePreview(makeContent('moduleA', '/work/a.hcp'));
    previewManager.updatePreview(makeContent('moduleB', '/work/b.hcp'));

    assert.strictEqual(panel.title, 'b - moduleB');
  });

  test('should fall back to module name when source path is unknown', () => {
    const { panel } = stubCreateWebviewPanel();

    const previewManager = new PreviewManager(extensionUri);
    previewManager.updatePreview(makeContent('moduleOnly', ''));

    assert.strictEqual(panel.title, 'moduleOnly');
  });

  test('should fall back to default title when both are unknown', () => {
    const { panel } = stubCreateWebviewPanel();

    const previewManager = new PreviewManager(extensionUri);
    previewManager.updatePreview(makeContent('', ''));

    assert.strictEqual(panel.title, 'HCP Preview');
  });

  test('should set the .hcp file icon as the tab icon', () => {
    const { panel } = stubCreateWebviewPanel();

    const previewManager = new PreviewManager(extensionUri);
    previewManager.updatePreview(makeContent('module', '/work/sample.hcp'));

    assert.ok(panel.iconPath, 'iconPath should be set');
    assert.ok(
      String(panel.iconPath.path).endsWith('resources/icon/preview_icon.svg'),
      `iconPath should point to preview_icon.svg: ${panel.iconPath.path}`
    );
  });
});
