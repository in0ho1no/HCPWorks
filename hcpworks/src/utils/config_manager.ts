import * as vscode from 'vscode';
import { DiagramDefine } from '../render/render_define';

/**
 * 設定を管理する
 */
export class ConfigManager {
  static readonly KEY_SVG_BG_COLOR = 'SvgBgColor'; // SVGの背景色設定

  /**
   * SVGの背景色設定を取得する
   */
  public getConfigSvgBgColor(): string {
    return vscode.workspace.getConfiguration('hcpworks').get(ConfigManager.KEY_SVG_BG_COLOR, DiagramDefine.DEFAULT_BG_COLOR);
  }
}
