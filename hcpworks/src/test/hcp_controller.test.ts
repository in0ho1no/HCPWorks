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

interface ControllerHarness {
  /** 設定変更イベントを発火する */
  fireConfigurationChange(affectedSection: string): void;

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
  const original = {
    createWebviewPanel: vscode.window.createWebviewPanel,
    registerCommand: vscode.commands.registerCommand,
    onDidChangeConfiguration: vscode.workspace.onDidChangeConfiguration,
    activeTextEditor: vscode.window.activeTextEditor,
  };

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hcpworks-ctrl-'));
  const filePath = path.join(tmpDir, 'sample.hcp');
  fs.writeFileSync(filePath, HCP_SOURCE, 'utf8');

  // Webviewへのhtml代入回数を数えるパネルスタブ
  let htmlUpdateCount = 0;
  const panel = {
    title: '',
    iconPath: undefined as vscode.Uri | undefined,
    webview: {
      _html: '',
      get html(): string { return this._html; },
      set html(value: string) { this._html = value; htmlUpdateCount++; },
      onDidReceiveMessage: () => ({ dispose: () => undefined }),
      postMessage: () => Promise.resolve(true),
    },
    onDidChangeViewState: () => ({ dispose: () => undefined }),
    onDidDispose: () => ({ dispose: () => undefined }),
    active: false,
  };

  // 登録されたコマンドと設定変更ハンドラを捕捉する
  const commandHandlers = new Map<string, (...args: unknown[]) => unknown>();
  const configHandlers: ((event: vscode.ConfigurationChangeEvent) => void)[] = [];

  (vscode.window as any).createWebviewPanel = () => panel;
  (vscode.commands as any).registerCommand = (command: string, callback: (...args: unknown[]) => unknown) => {
    commandHandlers.set(command, callback);
    return { dispose: () => undefined };
  };
  (vscode.workspace as any).onDidChangeConfiguration = (listener: (event: vscode.ConfigurationChangeEvent) => void) => {
    configHandlers.push(listener);
    return { dispose: () => undefined };
  };
  (vscode.window as any).activeTextEditor = {
    document: { fileName: filePath, languageId: 'hcp', uri: { fsPath: filePath } },
  };

  const context ={ subscriptions: [], extensionUri: vscode.Uri.file('/ext') } as unknown as vscode.ExtensionContext;
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
    htmlUpdateCount: () => htmlUpdateCount,
    dispose: () => {
      (vscode.window as any).createWebviewPanel = original.createWebviewPanel;
      (vscode.commands as any).registerCommand = original.registerCommand;
      (vscode.workspace as any).onDidChangeConfiguration = original.onDidChangeConfiguration;
      (vscode.window as any).activeTextEditor = original.activeTextEditor;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    },
  };
}

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

  test('should refresh the preview when a headerDisplay setting changes', () => {
    const before = harness.htmlUpdateCount();

    harness.fireConfigurationChange('hcpworks.headerDisplay');

    assert.ok(
      harness.htmlUpdateCount() > before,
      'changing hcpworks.headerDisplay should refresh the preview'
    );
  });

  test('should refresh the preview when SvgBgColor or WireColorTable changes', () => {
    for (const section of ['hcpworks.SvgBgColor', 'hcpworks.WireColorTable']) {
      const before = harness.htmlUpdateCount();

      harness.fireConfigurationChange(section);

      assert.ok(harness.htmlUpdateCount() > before, `changing ${section} should refresh the preview`);
    }
  });

  test('should not refresh the preview for an unrelated setting', () => {
    const before = harness.htmlUpdateCount();

    harness.fireConfigurationChange('editor.fontSize');

    assert.strictEqual(harness.htmlUpdateCount(), before);
  });
});
