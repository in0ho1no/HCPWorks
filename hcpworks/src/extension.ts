import * as vscode from 'vscode';
import {ModuleTreeProvider} from './tree_provider';

const TIMEOUT = 300;
const HCP_ID = "hcp";
const HCP_SUFFIX = `.${HCP_ID}`;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "hcpworks" is now active!');

  // 挙動確認用にサンプルを残しておく
  context.subscriptions.push(
    vscode.commands.registerCommand('hcpworks.helloWorld', () => {
      vscode.window.showInformationMessage('Hello World from HCPWorks!');
    })
  );

  // tree viewを保持
  const moduleTreeProvider = new ModuleTreeProvider();
  const moduleTreeView = vscode.window.createTreeView('hcpworks-View', { treeDataProvider: moduleTreeProvider });

  // モジュール一覧表示のイベント登録
  context.subscriptions.push(
    vscode.commands.registerCommand('hcpworks.listingModule', () => {
      // アクティブなエディタを取得
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found');
        return;
      }
      
      // 拡張子判定
      const fileName = editor.document.fileName;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'hcp') {
        vscode.window.showInformationMessage('Current file is not an HCP file');
        return;
      }

      // ファイルの内容を取得
      const fileContent = editor.document.getText();
      moduleTreeProvider.updateRootElements(fileContent);
      moduleTreeProvider.refresh();
    })
  );

  // ファイル表示時のイベントを用意(新規パネルが開かれたときのみ実行される)
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((e) => {
      // イベント発生直後は状態が完全でないため、一定時間待機する
      setTimeout(() => {
          if (e.languageId === HCP_ID || e.fileName.endsWith(HCP_SUFFIX)) {
            vscode.commands.executeCommand('hcpworks.listingModule');
          }
      }, TIMEOUT);
    })
  );

  // エディタを切り替えたときのイベントを用意
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((e) => {
      if (e) {
        if (e.document.languageId === HCP_ID || e.document.fileName.endsWith(HCP_SUFFIX)) {
          vscode.commands.executeCommand('hcpworks.listingModule');
        }
      }
    })
  );

  // VSCode起動時のチェック処理
  // 起動時に一度実行するだけなので、イベントリスナーには登録しない
  if (vscode.window.activeTextEditor) {
    const editor = vscode.window.activeTextEditor;
    if (editor.document.languageId === HCP_ID || editor.document.fileName.endsWith(HCP_SUFFIX)) {
      vscode.commands.executeCommand('hcpworks.listingModule');
    }
  }
}

export function deactivate() {}
