import * as vscode from 'vscode';

import { HCPController } from './hcp_controller';
import { ConfigManager } from './utils/config_manager';
import { FileManager } from './utils/file_manager';

export const TIMEOUT = 300;
export const HCP_ID = "hcp";
export const HCP_SUFFIX = `.${HCP_ID}`;

export function activate(context: vscode.ExtensionContext) {
  console.log('"hcpworks" is now active!');

  // 各マネージャーの初期化
  const configManager = new ConfigManager();
  const fileManager = new FileManager();

  // コントローラー初期化
  const controller = new HCPController(context, configManager, fileManager);
  controller.initialize();
}

export function deactivate() { }
