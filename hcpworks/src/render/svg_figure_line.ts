import { SvgFigureDefine } from './svg_figure_define';
import { DiagramDefine } from './render_define';
import { JumpSpan } from './wire_router';

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
    color: string = '000000'  // black
  ): string {
    return `<line x1="${startX}" y1="${startY}" ` +
      `x2="${endX}" y2="${endY}" ` +
      `stroke="#${color}"/>` +
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
    color: string = '000000'  // black
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
    color: string = '000000'  // black
  ): string {
    return SvgFigureLines.svgLine(
      startX, startY,
      startX, startY + length,
      color
    );
  }

  /**
   * 右向き矢印の矢頭を描画する
   *
   * @param endX 矢頭の先端X座標
   * @param y 矢頭のY座標
   * @param color 矢頭の色
   * @returns 矢頭のSVG文字列
   */
  private static arrowHeadR(endX: number, y: number, color: string): string {
    const arrowHead = SvgFigureDefine.ARROW_HEAD;
    const halfArrowHead = Math.ceil(arrowHead / 2);
    return `<path d="M ${endX} ${y} ` +
      `L ${endX - arrowHead} ${y - halfArrowHead} ` +
      `M ${endX} ${y} ` +
      `L ${endX - arrowHead} ${y + halfArrowHead}" ` +
      `stroke="#${color}" fill="#${color}" />` +
      `${SvgFigureDefine.LINE_BREAK}`;
  }

  /**
   * 左向き矢印の矢頭を描画する
   *
   * @param startX 矢頭の先端X座標
   * @param y 矢頭のY座標
   * @param color 矢頭の色
   * @returns 矢頭のSVG文字列
   */
  private static arrowHeadL(startX: number, y: number, color: string): string {
    const arrowHead = SvgFigureDefine.ARROW_HEAD;
    const halfArrowHead = Math.ceil(arrowHead / 2);
    return `<path d="M ${startX} ${y} ` +
      `L ${startX + arrowHead} ${y - halfArrowHead} ` +
      `M ${startX} ${y} ` +
      `L ${startX + arrowHead} ${y + halfArrowHead}" ` +
      `stroke="#${color}" fill="#${color}" />` +
      `${SvgFigureDefine.LINE_BREAK}`;
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
    color: string = '000000'  // black
  ): string {
    const endX = startX + length;
    const svgLineText = SvgFigureLines.svgLine(startX, startY, endX, startY, color);
    return `${svgLineText}` + SvgFigureLines.arrowHeadR(endX, startY, color);
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
    color: string = '000000'  // black
  ): string {
    const endX = startX + length;
    const svgLineText = SvgFigureLines.svgLine(startX, startY, endX, startY, color);
    return `${svgLineText}` + SvgFigureLines.arrowHeadL(startX, startY, color);
  }

  /**
   * ジャンプアーク付き水平線のパス(d属性)を組み立てる
   *
   * 各ジャンプ区間は上向きに凸のアークで跨ぐ。結合された橋は楕円弧になる。
   *
   * @param startX 開始X座標
   * @param y Y座標
   * @param endX 終了X座標
   * @param jumps ジャンプ区間(昇順・非重複)
   * @param ry アークの高さ(Y半径)
   * @returns path要素のd属性文字列
   */
  static buildHPathD(
    startX: number,
    y: number,
    endX: number,
    jumps: JumpSpan[],
    ry: number
  ): string {
    const parts: string[] = [`M ${startX} ${y}`];
    let cursorX = startX;

    for (const jump of jumps) {
      if (jump.startX > cursorX) {
        parts.push(`L ${jump.startX} ${y}`);
      }
      const rx = (jump.endX - jump.startX) / 2;
      parts.push(`A ${rx} ${ry} 0 0 1 ${jump.endX} ${y}`);
      cursorX = jump.endX;
    }

    if (cursorX < endX) {
      parts.push(`L ${endX} ${y}`);
    }
    return parts.join(' ');
  }

  /**
   * ジャンプアーク付きの水平線を描画する
   *
   * ジャンプがない場合はdrawLineHと同一の出力になる。
   *
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @param length 線の長さ
   * @param jumps ジャンプ区間(昇順・非重複)
   * @param color 線の色
   * @returns 水平線のSVG文字列
   */
  static drawLineHWithJumps(
    startX: number,
    startY: number,
    length: number,
    jumps: JumpSpan[],
    color: string = '000000'  // black
  ): string {
    if (jumps.length === 0) {
      return SvgFigureLines.drawLineH(startX, startY, length, color);
    }
    const d = SvgFigureLines.buildHPathD(startX, startY, startX + length, jumps, DiagramDefine.JUMP_RADIUS);
    return `<path d="${d}" stroke="#${color}" fill="none"/>` +
      `${SvgFigureDefine.LINE_BREAK}`;
  }

  /**
   * ジャンプアーク付きの右向き矢印を描画する
   *
   * ジャンプがない場合はdrawArrowRと同一の出力になる。
   *
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @param length 矢印の長さ
   * @param jumps ジャンプ区間(昇順・非重複)
   * @param color 矢印の色
   * @returns 右向き矢印のSVG文字列
   */
  static drawArrowRWithJumps(
    startX: number,
    startY: number,
    length: number,
    jumps: JumpSpan[],
    color: string = '000000'  // black
  ): string {
    if (jumps.length === 0) {
      return SvgFigureLines.drawArrowR(startX, startY, length, color);
    }
    return SvgFigureLines.drawLineHWithJumps(startX, startY, length, jumps, color) +
      SvgFigureLines.arrowHeadR(startX + length, startY, color);
  }

  /**
   * ジャンプアーク付きの左向き矢印を描画する
   *
   * ジャンプがない場合はdrawArrowLと同一の出力になる。
   *
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @param length 矢印の長さ
   * @param jumps ジャンプ区間(昇順・非重複)
   * @param color 矢印の色
   * @returns 左向き矢印のSVG文字列
   */
  static drawArrowLWithJumps(
    startX: number,
    startY: number,
    length: number,
    jumps: JumpSpan[],
    color: string = '000000'  // black
  ): string {
    if (jumps.length === 0) {
      return SvgFigureLines.drawArrowL(startX, startY, length, color);
    }
    return SvgFigureLines.drawLineHWithJumps(startX, startY, length, jumps, color) +
      SvgFigureLines.arrowHeadL(startX, startY, color);
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
