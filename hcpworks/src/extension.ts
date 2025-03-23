import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "hcpworks" is now active!');

  // 挙動確認用にサンプルを残しておく
  context.subscriptions.push(
    vscode.commands.registerCommand('hcpworks.helloWorld', () => {
      vscode.window.showInformationMessage('Hello World from HCPWorks!');
    })
  );
}

export function deactivate() {}
