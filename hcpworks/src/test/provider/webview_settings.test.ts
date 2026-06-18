import * as assert from 'assert';
import * as vscode from 'vscode';
import { NumberInputViewProvider } from '../../provider/webview_settings';
import { LineLevel } from '../../parse/line_level';

/**
 * resolveWebviewView に渡す WebviewView のモックを生成する。
 * 生成されたHTMLと、登録されたメッセージハンドラを取得できるようにする。
 */
function createWebviewViewMock() {
  let messageHandler: ((data: { type: string; value: number }) => void) | undefined;
  const webview = {
    options: {} as object,
    html: '',
    onDidReceiveMessage: (cb: (data: { type: string; value: number }) => void) => {
      messageHandler = cb;
      return { dispose: () => undefined };
    },
  };
  const webviewView = { webview };
  return {
    webviewView,
    getHtml: () => webview.html,
    sendMessage: (data: { type: string; value: number }) => messageHandler?.(data),
  };
}

function resolveProvider() {
  const provider = new NumberInputViewProvider({} as vscode.Uri);
  const mock = createWebviewViewMock();
  provider.resolveWebviewView(
    mock.webviewView as unknown as vscode.WebviewView,
    {} as vscode.WebviewViewResolveContext,
    {} as vscode.CancellationToken
  );
  return { provider, mock };
}

suite('NumberInputViewProvider - Enter key support', () => {
  // webview内のスクリプトはDOM上で実行できないため、Enter確定機能が
  // 生成HTMLに組み込まれていることのみを担保する。
  test('生成HTMLに Enter キーでの確定処理が含まれる', () => {
    const { mock } = resolveProvider();
    const html = mock.getHtml();

    assert.ok(html.includes("addEventListener('keydown'"), 'keydown リスナーが存在すること');
    assert.ok(html.includes("event.key === 'Enter'"), 'Enter キーを判定していること');
    assert.ok(html.includes('event.preventDefault()'), '既定動作を抑止していること');
  });
});

suite('NumberInputViewProvider - valueChanged メッセージ処理', () => {
  test('範囲内の値はそのまま反映される', () => {
    const { provider, mock } = resolveProvider();

    mock.sendMessage({ type: 'valueChanged', value: 5 });

    assert.strictEqual(provider.getLevelLimit(), 5);
  });

  test('最小値未満は最小値にクランプされる', () => {
    const { provider, mock } = resolveProvider();

    mock.sendMessage({ type: 'valueChanged', value: LineLevel.LEVEL_MIN });

    assert.strictEqual(provider.getLevelLimit(), LineLevel.LEVEL_MIN + 1);
  });

  test('最大値超過は最大値にクランプされる', () => {
    const { provider, mock } = resolveProvider();

    mock.sendMessage({ type: 'valueChanged', value: LineLevel.LEVEL_MAX + 100 });

    assert.strictEqual(provider.getLevelLimit(), LineLevel.LEVEL_MAX);
  });
});
