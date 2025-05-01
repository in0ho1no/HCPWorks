import * as vscode from 'vscode';

export class NumberInputViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) { }

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
          console.log(`値が変更されました: ${data.value}`);
          // ここで値を使った処理を行う
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
          padding: 10px;
          color: var(--vscode-foreground);
          font-family: var(--vscode-font-family);
        }
        .input-container {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
        }
        input[type="number"] {
          width: 100%;
          padding: 5px;
          background-color: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
          border: 1px solid var(--vscode-input-border);
        }
        button {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 5px 10px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="input-container">
        <label for="numberInput">描画レベル:</label>
        <input type="number" id="numberInput" min="1" max="20" value="10" step="1" placeholder="メッセージ">
      </div>
      <button id="applyButton">適用</button>

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
}
