import * as vscode from 'vscode';
import { LineLevel } from './parse/line_level';

export class NumberInputViewProvider implements vscode.WebviewViewProvider {
  private readonly INPUT_LEVEL_MIN = LineLevel.LEVEL_MIN + 1;
  private readonly INPUT_LEVEL_MAX = LineLevel.LEVEL_MAX;
  private readonly INPUT_LEVEL_INI = LineLevel.LEVEL_MAX;
  private _levelLimit: number;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._levelLimit = LineLevel.LEVEL_MAX;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // WebViewからのメッセージを処理
    webviewView.webview.onDidReceiveMessage(data => {
      switch (data.type) {
        case 'valueChanged':
          this.setLevelLimit(data.value);
          vscode.commands.executeCommand('hcpworks.configLevelLimit');
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>描画レベル</title>
      <style>
        body {
          padding: 8px;
          margin: 0;
        }
        input[type="number"], button {
          width: 100%;
          box-sizing: border-box;
          padding: 5px;
          margin: 3px 0;
          background-color: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
          border: 1px solid var(--vscode-input-border);
          border-radius: 1px;
        }
        button {
          cursor: pointer;
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
        }
        button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }
      </style>
    </head>
    <body>
      <input type="number" id="numberInput" min="${this.INPUT_LEVEL_MIN}" max="${this.INPUT_LEVEL_MAX}" value="${this.INPUT_LEVEL_INI}" step="1" placeholder="描画レベル">
      <button id="applyButton">描画レベル確定</button>

      <script>
        const vscode = acquireVsCodeApi();
        const numberInput = document.getElementById('numberInput');
        const applyButton = document.getElementById('applyButton');

        // 値が変更されたときのイベント
        applyButton.addEventListener('click', () => {
          const value = parseInt(numberInput.value, 10);
          vscode.postMessage({
            type: 'valueChanged',
            value: value
          });
        });
      </script>
    </body>
    </html>`;
  }

  getLevelLimit(): number { return this._levelLimit; }
  setLevelLimit(inputLevelLimit: number): void {
    if (inputLevelLimit < this.INPUT_LEVEL_MIN) {
      this._levelLimit = this.INPUT_LEVEL_MIN;
    } else if (inputLevelLimit > this.INPUT_LEVEL_MAX) {
      this._levelLimit = this.INPUT_LEVEL_MAX;
    } else {
      this._levelLimit = inputLevelLimit;
    }
  }

}
