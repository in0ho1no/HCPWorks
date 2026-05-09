"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberInputViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const line_level_1 = require("../parse/line_level");
class NumberInputViewProvider {
    _extensionUri;
    INPUT_LEVEL_MIN = line_level_1.LineLevel.LEVEL_MIN + 1;
    INPUT_LEVEL_MAX = line_level_1.LineLevel.LEVEL_MAX;
    INPUT_LEVEL_INI = line_level_1.LineLevel.LEVEL_MAX;
    _levelLimit;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this._levelLimit = line_level_1.LineLevel.LEVEL_MAX;
    }
    resolveWebviewView(webviewView, context, _token) {
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
    _getHtmlForWebview(webview) {
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
    getLevelLimit() { return this._levelLimit; }
    setLevelLimit(inputLevelLimit) {
        if (inputLevelLimit < this.INPUT_LEVEL_MIN) {
            this._levelLimit = this.INPUT_LEVEL_MIN;
        }
        else if (inputLevelLimit > this.INPUT_LEVEL_MAX) {
            this._levelLimit = this.INPUT_LEVEL_MAX;
        }
        else {
            this._levelLimit = inputLevelLimit;
        }
    }
}
exports.NumberInputViewProvider = NumberInputViewProvider;
//# sourceMappingURL=webview_settings.js.map