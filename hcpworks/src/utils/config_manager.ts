import * as vscode from 'vscode';
import { DiagramDefine } from '../render/render_define';

/**
 * 設定を管理する
 */
export class ConfigManager {

  /**
   * SVGの背景色設定を取得する
   */
  public getConfigSvgBgColor(): string {
    return vscode.workspace.getConfiguration('hcpworks').get('SvgBgColor', DiagramDefine.DEFAULT_BG_COLOR);
  }

  /**
   * SVGの背景色設定を取得する
   */
  public getConfigWireColorTable(): string[] {
    return vscode.workspace.getConfiguration('hcpworks').get('WireColorTable', DiagramDefine.WIRE_COLOR_TABLE);
  }
}
