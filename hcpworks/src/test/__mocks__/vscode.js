"use strict";
// Minimal VSCode mock for unit testing without the Electron runtime
Object.defineProperty(exports, "__esModule", { value: true });
exports.window = {
  showWarningMessage: () => Promise.resolve(undefined),
  showErrorMessage: () => Promise.resolve(undefined),
  showInformationMessage: () => Promise.resolve(undefined),
};
exports.workspace = {
  getConfiguration: () => ({
    get: (_key, defaultValue) => defaultValue,
  }),
};
