import * as vscode from 'vscode';
import { DiagramDefine } from '../render/render_define';
import { HeaderDisplayOptions, DEFAULT_HEADER_DISPLAY_OPTIONS } from './header_display_options';

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

  public getConfigHeaderDisplayOptions(): HeaderDisplayOptions {
    const config = vscode.workspace.getConfiguration('hcpworks.headerDisplay');
    return {
      showName:  config.get('showName',  DEFAULT_HEADER_DISPLAY_OPTIONS.showName),
      showScope: config.get('showScope', DEFAULT_HEADER_DISPLAY_OPTIONS.showScope),
      showKind:  config.get('showKind',  DEFAULT_HEADER_DISPLAY_OPTIONS.showKind),
    };
  }
}
