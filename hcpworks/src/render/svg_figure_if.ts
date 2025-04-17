
import { LineTypeDefine, LineTypeEnum } from '../parse/line_define';
import { SvgFigureParts } from './svg_figure_parts';
import { DiagramElement } from './diagram_element';

/**
 * 図形描画を管理するクラス
 */
export class DrawFigure {
  private _figureMethodMap: Map<number, Function>;

  /**
   * 初期化メソッド
   * 
   */
  constructor() {
    // 種別値と描画メソッドのマッピングテーブルを構築
    this._figureMethodMap = new Map<number, Function>([
      [LineTypeDefine.get_format_by_type(LineTypeEnum.NORMAL).type_value, SvgFigureParts.drawFigureNormal],
      [LineTypeDefine.get_format_by_type(LineTypeEnum.FORK).type_value, SvgFigureParts.drawFigureFork],
      [LineTypeDefine.get_format_by_type(LineTypeEnum.REPEAT).type_value, SvgFigureParts.drawFigureRepeat],
      [LineTypeDefine.get_format_by_type(LineTypeEnum.MOD).type_value, SvgFigureParts.drawFigureMod],
      [LineTypeDefine.get_format_by_type(LineTypeEnum.RETURN).type_value, SvgFigureParts.drawFigureReturn],
      [LineTypeDefine.get_format_by_type(LineTypeEnum.TRUE).type_value, SvgFigureParts.drawFigureTrue],
      [LineTypeDefine.get_format_by_type(LineTypeEnum.FALSE).type_value, SvgFigureParts.drawFigureFalse],
      [LineTypeDefine.get_format_by_type(LineTypeEnum.BRANCH).type_value, SvgFigureParts.drawFigureBranch],
      [LineTypeDefine.get_format_by_type(LineTypeEnum.DATA).type_value, SvgFigureParts.drawFigureData],
    ]);
  }

  /**
   * 要素の種別に応じた図形を描画する
   * 
   * @param element 描画要素情報
   * @returns 描画した図形の[行の終端位置 , 処理を意味する行のSVG文字列]
   */
  drawFigureMethod(element: DiagramElement): [number, string] {
    // 要素の種別に対応するメソッドを取得
    const drawMethod = this._figureMethodMap.get(element.getLineInfo().getType().type_value);

    // メソッドが見つかれば実行する
    if (drawMethod) {
      return drawMethod(element.getX(), element.getY(), element.getLineInfo().getTextLessTypeIO());
    }
    return [0, ""];
  }
}
