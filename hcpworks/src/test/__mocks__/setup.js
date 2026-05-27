"use strict";
const Module = require('module');
const path = require('path');
const orig = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  if (request === 'vscode') {
    return path.resolve(__dirname, 'vscode.js');
  }
  return orig.call(this, request, parent, isMain, options);
};
