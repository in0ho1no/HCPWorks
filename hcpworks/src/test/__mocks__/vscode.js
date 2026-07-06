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
exports.Uri = {
  file: (p) => ({ fsPath: p, path: p, toString: () => `file://${p}` }),
  joinPath: (base, ...segments) => {
    const joined = [base.path, ...segments].join('/');
    return { fsPath: joined, path: joined, toString: () => `file://${joined}` };
  },
};
exports.workspace = {
  getConfiguration: () => ({
    get: (_key, defaultValue) => defaultValue,
  }),
};
exports.commands = {
  executeCommand: () => Promise.resolve(undefined),
};
exports.FoldingRange = class FoldingRange {
  constructor(start, end, kind) {
    this.start = start;
    this.end = end;
    this.kind = kind;
  }
};
exports.FoldingRangeKind = {
  Comment: 1,
  Imports: 2,
  Region: 3,
};
exports.languages = {
  registerFoldingRangeProvider: () => ({ dispose: () => undefined }),
};
