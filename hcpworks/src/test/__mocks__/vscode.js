"use strict";
// Minimal VSCode mock for unit testing without the Electron runtime
Object.defineProperty(exports, "__esModule", { value: true });
exports.window = {
  showWarningMessage: () => Promise.resolve(undefined),
  showErrorMessage: () => Promise.resolve(undefined),
  showInformationMessage: () => Promise.resolve(undefined),
  createWebviewPanel: () => ({
    webview: {
      html: '',
      onDidReceiveMessage: () => ({ dispose: () => undefined }),
      postMessage: () => Promise.resolve(true),
    },
    onDidChangeViewState: () => ({ dispose: () => undefined }),
    onDidDispose: () => ({ dispose: () => undefined }),
    active: false,
  }),
};
exports.ViewColumn = {
  Beside: -2,
};
exports.workspace = {
  getConfiguration: () => ({
    get: (_key, defaultValue) => defaultValue,
  }),
};
exports.commands = {
  executeCommand: () => Promise.resolve(undefined),
};
