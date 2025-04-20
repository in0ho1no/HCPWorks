import { SvgFigureDefine } from './svg_figure_define';

export class SvgFigureLines {

  /**
   * 基本的な直線を描画する
   * 
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @param endX 終了X座標
   * @param endY 終了Y座標
   * @param color 線の色
   * @returns 直線のSVG文字列
   */
  static svgLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string = 'black'
  ): string {
    return `<line x1="${startX}" y1="${startY}" ` +
      `x2="${endX}" y2="${endY}" ` +
      `stroke="${color}"/>` +
      `${SvgFigureDefine.LINE_BREAK}`;
  }

  /**
   * 水平線を描画する
   * 
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @param length 線の長さ
   * @param color 線の色
   * @returns 水平線のSVG文字列
   */
  static drawLineH(
    startX: number,
    startY: number,
    length: number,
    color: string = 'black'
  ): string {
    return SvgFigureLines.svgLine(
      startX, startY,
      startX + length, startY,
      color
    );
  }

  /**
   * 垂直線を描画する
   * 
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @param length 線の長さ
   * @param color 線の色
   * @returns 垂直線のSVG文字列
   */
  static drawLineV(
    startX: number,
    startY: number,
    length: number,
    color: string = 'black'
  ): string {
    return SvgFigureLines.svgLine(
      startX, startY,
      startX, startY + length,
      color
    );
  }

  /**
   * 右向き矢印を描画する
   * 
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @param length 矢印の長さ
   * @param color 矢印の色
   * @returns 右向き矢印のSVG文字列
   */
  static drawArrowR(
    startX: number,
    startY: number,
    length: number,
    color: string = 'black'
  ): string {
    const endX = startX + length;
    const svgLineText = SvgFigureLines.svgLine(startX, startY, endX, startY, color);
    const arrowHead = SvgFigureDefine.ARROW_HEAD;
    const halfArrowHead = Math.ceil(arrowHead / 2);
    return `${svgLineText}` +
      `<path d="M ${endX} ${startY} ` +
      `L ${endX - arrowHead} ${startY - halfArrowHead} ` +
      `M ${endX} ${startY} ` +
      `L ${endX - arrowHead} ${startY + halfArrowHead}" ` +
      `stroke="${color}" fill="${color}" />` +
      `${SvgFigureDefine.LINE_BREAK}`;
  }

  /**
   * 左向き矢印を描画する
   * 
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @param length 矢印の長さ
   * @param color 矢印の色
   * @returns 左向き矢印のSVG文字列
   */
  static drawArrowL(
    startX: number,
    startY: number,
    length: number,
    color: string = 'black'
  ): string {
    const endX = startX + length;
    const svgLineText = SvgFigureLines.svgLine(startX, startY, endX, startY, color);
    const arrowHead = SvgFigureDefine.ARROW_HEAD;
    const halfArrowHead = Math.ceil(arrowHead / 2);
    return `${svgLineText}` +
      `<path d="M ${startX} ${startY} ` +
      `L ${startX + arrowHead} ${startY - halfArrowHead} ` +
      `M ${startX} ${startY} ` +
      `L ${startX + arrowHead} ${startY + halfArrowHead}" ` +
      `stroke="${color}" fill="${color}" />` +
      `${SvgFigureDefine.LINE_BREAK}`;
  }

  /**
   * レベルの始点を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @returns レベルの始点のSVG文字列
   */
  static drawLevelStart(
    centerX: number,
    centerY: number,
  ): string {
    // 上部の垂直線
    const circleTop = centerY - SvgFigureDefine.CIRCLE_R;
    const vLineTop = circleTop - SvgFigureDefine.FIGURE_SPACE;
    const svgLineTopV = SvgFigureLines.drawLineV(centerX, vLineTop, SvgFigureDefine.FIGURE_SPACE);

    // 上部の水平線
    const circleLeft = centerX - SvgFigureDefine.CIRCLE_R;
    const svgLineTopH = SvgFigureLines.drawLineH(circleLeft, vLineTop, SvgFigureDefine.FIGURE_WIDTH);
    return svgLineTopV + svgLineTopH;
  }

  /**
   * レベルの終点を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @returns レベルの始点のSVG文字列
   */
  static drawLevelEnd(
    centerX: number,
    centerY: number,
  ): string {
    // 下部の垂直線
    const circleBottom = centerY + SvgFigureDefine.CIRCLE_R;
    const svgLineBottomV = SvgFigureLines.drawLineV(centerX, circleBottom, SvgFigureDefine.FIGURE_SPACE);

    // 下部の水平線
    const circleLeft = centerX - SvgFigureDefine.CIRCLE_R;
    const vLineBottom = circleBottom + SvgFigureDefine.FIGURE_SPACE;
    const svgLineBottomH = SvgFigureLines.drawLineH(circleLeft, vLineBottom, SvgFigureDefine.FIGURE_WIDTH);
    return svgLineBottomV + svgLineBottomH;
  }

  /**
   * レベルのステップを描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @returns レベルの始点のSVG文字列
   */
  static drawLevelStep(
    centerX: number,
    centerY: number,
  ): string {
    // 上部の垂直線
    const circleTop = centerY - SvgFigureDefine.CIRCLE_R;
    const vLineTop = circleTop - SvgFigureDefine.FIGURE_SPACE;
    const svgLineTopV = SvgFigureLines.drawLineV(centerX, vLineTop, SvgFigureDefine.FIGURE_SPACE);

    // 上部の左にシフトした水平線
    const circleLeft = centerX - SvgFigureDefine.CIRCLE_R;
    const hLineLShift = circleLeft - SvgFigureDefine.FIGURE_SPACE;
    const svgLineLShiftH = SvgFigureLines.drawLineH(hLineLShift, vLineTop, SvgFigureDefine.FIGURE_WIDTH);

    // 上部の左にシフトした垂直線
    const vLineLShiftTop = vLineTop - SvgFigureDefine.FIGURE_HEIGHT;
    const svgLineLShiftV = SvgFigureLines.drawLineV(hLineLShift, vLineLShiftTop, SvgFigureDefine.FIGURE_HEIGHT);
    return svgLineTopV + svgLineLShiftH + svgLineLShiftV;
  }
}
