import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { HCPController } from '../hcp_controller';
import { ModuleTreeElement } from '../provider/tree_element';
import { ConfigManager } from '../utils/config_manager';
import { FileManager } from '../utils/file_manager';

const MODULE_NAME = 'sampleModule';
const HCP_SOURCE = ['\\module ' + MODULE_NAME, '\t\\mod 処理を実行する', ''].join('\n');

/** 設定変更イベントのスタブ。指定セクションのみ影響ありとして扱う */
function makeConfigurationChangeEvent(affectedSection: string): vscode.ConfigurationChangeEvent {
  return {
    affectsConfiguration: (section: string) => section === affectedSection,
  };
}

/** 何もしないDisposableを返す */
function makeDisposableStub(): vscode.Disposable {
  return { dispose: () => undefined };
}

/**
 * vscode APIのプロパティを一時的に差し替え、元に戻す関数を返す
 *
 * 実VSCodeの window.activeTextEditor などはgetterのみで定義されているため、
 * 単純な代入はstrict modeでTypeErrorになる。ディスクリプタごと差し替える。
 */
function stubProperty(target: object, key: string, value: unknown): () => void {
  const original = Object.getOwnPropertyDescriptor(target, key);

  Object.defineProperty(target, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });

  return () => {
    if (original) {
      Object.defineProperty(target, key, original);
    } else {
      delete (target as Record<string, unknown>)[key];
    }
  };
}

interface ControllerHarness {
  /** 設定変更イベントを発火する */
  fireConfigurationChange(affectedSection: string): void;

  /** 登録済みコマンドを実行する */
  runCommand(command: string, ...args: unknown[]): void;

  /** 登録されたコマンド名の一覧 */
  registeredCommands(): string[];

  /** Webviewへ送られたメッセージ */
  postedMessages(): { command?: string }[];

  /** Webviewへ設定されたHTMLの回数(=プレビュー更新回数) */
  htmlUpdateCount(): number;

  /** スタブを元に戻し一時ファイルを削除する */
  dispose(): void;
}

/**
 * HCPControllerを初期化し、プレビューを1件表示した状態のハーネスを作る
 *
 * 実ファイルを読ませてモジュールツリーを構築するため、一時ディレクトリに .hcp を書き出す。
 */
function setupController(): ControllerHarness {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hcpworks-ctrl-'));
  const filePath = path.join(tmpDir, 'sample.hcp');
  fs.writeFileSync(filePath, HCP_SOURCE, 'utf8');

  // Webviewへのhtml代入回数と送信メッセージを記録するパネルスタブ
  let htmlUpdateCount = 0;
  const postedMessages: { command?: string }[] = [];
  const panel = {
    title: '',
    iconPath: undefined as vscode.Uri | undefined,
    webview: {
      _html: '',
      get html(): string { return this._html; },
      set html(value: string) { this._html = value; htmlUpdateCount++; },
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

  // 登録されたコマンドと設定変更ハンドラを捕捉する
  const commandHandlers = new Map<string, (...args: unknown[]) => unknown>();
  const configHandlers: ((event: vscode.ConfigurationChangeEvent) => void)[] = [];

  const restoreStubs: (() => void)[] = [];
  const stub = (target: object, key: string, value: unknown): void => {
    restoreStubs.push(stubProperty(target, key, value));
  };

  stub(vscode.window, 'createWebviewPanel', () => panel);
  stub(vscode.commands, 'registerCommand', (command: string, callback: (...args: unknown[]) => unknown) => {
    commandHandlers.set(command, callback);
    return makeDisposableStub();
  });
  stub(vscode.workspace, 'onDidChangeConfiguration', (listener: (event: vscode.ConfigurationChangeEvent) => void) => {
    configHandlers.push(listener);
    return makeDisposableStub();
  });
  stub(vscode.window, 'activeTextEditor', {
    document: { fileName: filePath, languageId: 'hcp', uri: { fsPath: filePath } },
  });

  // 実VSCode上ではビューの二重登録が例外になるため、登録もスタブに差し替える
  stub(vscode.window, 'createTreeView', makeDisposableStub);
  stub(vscode.window, 'registerWebviewViewProvider', makeDisposableStub);

  // 起動時チェックから実コマンドが動いて描画回数が変わらないようにする
  stub(vscode.commands, 'executeCommand', () => Promise.resolve(undefined));

  const subscriptions: vscode.Disposable[] = [];
  const context = { subscriptions, extensionUri: vscode.Uri.file('/ext') } as unknown as vscode.ExtensionContext;
  const controller = new HCPController(context, new ConfigManager(), new FileManager());
  controller.initialize();

  // モジュールツリーを構築し、プレビューを1件表示させる
  commandHandlers.get('hcpworks.listingModule')?.();
  commandHandlers.get('hcpworks.itemClicked')?.(
    new ModuleTreeElement(filePath, MODULE_NAME, ['\t\\mod 処理を実行する'])
  );

  return {
    fireConfigurationChange: (affectedSection: string) => {
      for (const handler of configHandlers) {
        handler(makeConfigurationChangeEvent(affectedSection));
      }
    },
    runCommand: (command: string, ...args: unknown[]) => {
      commandHandlers.get(command)?.(...args);
    },
    registeredCommands: () => [...commandHandlers.keys()],
    postedMessages: () => postedMessages,
    htmlUpdateCount: () => htmlUpdateCount,
    dispose: () => {
      // 実VSCode上ではイベント購読などが実際に登録されるため、テストごとに破棄する
      for (const subscription of subscriptions) {
        subscription.dispose();
      }
      for (const restore of restoreStubs.reverse()) {
        restore();
      }
      fs.rmSync(tmpDir, { recursive: true, force: true });
    },
  };
}

suite('HCPController - Command - registration', () => {
  let harness: ControllerHarness;

  setup(() => {
    harness = setupController();
  });

  teardown(() => {
    harness.dispose();
  });

  test('should register every command contributed in package.json', () => {
    const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
    const contributed: string[] = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      .contributes.commands.map((entry: { command: string }) => entry.command);

    assert.ok(contributed.length > 0, 'package.json should contribute commands');
    for (const command of contributed) {
      assert.ok(
        harness.registeredCommands().includes(command),
        `${command} is contributed in package.json but never registered`
      );
    }
  });

  test('should ask the webview to reset the view', () => {
    harness.runCommand('hcpworks.resetPreviewView');

    assert.deepStrictEqual(harness.postedMessages(), [{ command: 'resetView' }]);
  });
});

suite('HCPController - Event - onDidChangeConfiguration', () => {
  let harness: ControllerHarness;

  setup(() => {
    harness = setupController();
  });

  teardown(() => {
    harness.dispose();
  });

  test('should have rendered the preview once before any configuration change', () => {
    assert.strictEqual(harness.htmlUpdateCount(), 1);
  });

  test('should refresh the preview exactly once for each preview-affecting setting', () => {
    const sections = ['hcpworks.SvgBgColor', 'hcpworks.WireColorTable', 'hcpworks.headerDisplay'];

    for (const section of sections) {
      const before = harness.htmlUpdateCount();

      harness.fireConfigurationChange(section);

      // 2回描画されると、パースからSVG生成までが丸ごと二重に走る
      assert.strictEqual(
        harness.htmlUpdateCount(),
        before + 1,
        `changing ${section} should refresh the preview exactly once`
      );
    }
  });

  test('should not refresh the preview for an unrelated setting', () => {
    const before = harness.htmlUpdateCount();

    harness.fireConfigurationChange('editor.fontSize');

    assert.strictEqual(harness.htmlUpdateCount(), before);
  });
});
