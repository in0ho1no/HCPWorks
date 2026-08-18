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
  createTreeView: () => ({ dispose: () => undefined }),
  registerWebviewViewProvider: () => ({ dispose: () => undefined }),
  onDidChangeActiveTextEditor: () => ({ dispose: () => undefined }),
  activeTextEditor: undefined,
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
  onDidOpenTextDocument: () => ({ dispose: () => undefined }),
  onDidSaveTextDocument: () => ({ dispose: () => undefined }),
  onDidChangeConfiguration: () => ({ dispose: () => undefined }),
};
exports.commands = {
  executeCommand: () => Promise.resolve(undefined),
  registerCommand: () => ({ dispose: () => undefined }),
};
exports.EventEmitter = class EventEmitter {
  constructor() {
    this._listeners = [];
    this.event = (listener) => {
      this._listeners.push(listener);
      return { dispose: () => undefined };
    };
  }
  fire(data) {
    for (const listener of this._listeners) {
      listener(data);
    }
  }
  dispose() {
    this._listeners = [];
  }
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
