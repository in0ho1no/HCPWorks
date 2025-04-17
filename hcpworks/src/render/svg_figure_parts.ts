import { SvgFigureDefine } from './svg_figure_define';
import { SvgFigureText } from './svg_figure_text';
import { SvgFigureLines } from './svg_figure_line';

export class SvgFigureParts {

  /**
   * 基本的な円を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @param radius 円の半径
   * @returns 円のSVG文字列
   */
  static svgCircle(
    centerX: number,
    centerY: number,
    radius: number,
  ): string {
    return `<circle cx="${centerX}" cy="${centerY}" ` +
      `r="${radius}" fill="white" stroke="black"/>` +
      `${SvgFigureDefine.LINE_BREAK}`;
  }

  /**
   * 基本的な三角形を描画する
   * 
   * @param vertices 三角形の頂点座標
   * @returns 三角形のSVG文字列
   */
  static svgTriangle(
    vertices: number[][],
  ): string {
    return `<polygon points="` +
      `${vertices[0][0]} ${vertices[0][1]} ` +
      `${vertices[1][0]} ${vertices[1][1]} ` +
      `${vertices[2][0]} ${vertices[2][1]}" ` +
      `fill="white" stroke="black"/>` +
      `${SvgFigureDefine.LINE_BREAK}`;
  }

  /**
   * 右巻き矢印を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @returns 右巻き矢印のSVG文字列
   */
  static svgArcArrowR(
    centerX: number,
    centerY: number,
  ): string {
    const radius = SvgFigureDefine.CIRCLE_R - Math.floor(SvgFigureDefine.CIRCLE_R / 2);  // 半径

    const startX = centerX;
    const startY = centerY - radius;

    const endX = centerX;
    const endY = centerY + radius;

    const xAxisRotation = 0;  // 公式ドキュメントでも0固定
    const largeArcFlag = 0;   // 半円なので0固定
    const sweepFlag = 1;      // 右周りの指定なので1

    const svgArcText = `<path d="` +
      `M ${startX} ${startY} ` +    // 始点へ移動
      `A ${radius} ${radius}, ` +   // X軸方向・Y軸方向の半径
      `${xAxisRotation} ${largeArcFlag} ${sweepFlag} ` +
      `${endX} ${endY}" ` +         // 終点
      `stroke="black" fill="transparent"/>` +
      `${SvgFigureDefine.LINE_BREAK}`;

    const svgArrowText = `<path d="` +
      `M ${endX} ${endY} L ${endX + 2} ${endY - 4} ` + // 始点へ移動して、描画
      `L ${endX + 4} ${endY + 0.5} Z" ` +             // パスを閉じる
      `stroke="black" fill="black"/>` +
      `${SvgFigureDefine.LINE_BREAK}`;

    return svgArcText + svgArrowText;
  }

  /**
   * 基本的な四角を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @returns 四角のSVG文字列
   */
  static svgRect(
    centerX: number,
    centerY: number,
  ): string {
    return `<rect ` +
      `x="${centerX - SvgFigureDefine.CIRCLE_R}" y="${centerY - SvgFigureDefine.CIRCLE_R}" ` +
      `width="${SvgFigureDefine.FIGURE_WIDTH}" height="${SvgFigureDefine.FIGURE_HEIGHT}" ` +
      `fill="white" stroke="black"/>` +
      `${SvgFigureDefine.LINE_BREAK}`;
  }

  /**
   * 関数への入力を意味する図形を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @returns 図形のSVG文字列
   */
  static svgDataFuncIn(
    centerX: number,
    centerY: number
  ): string {
    return `<path d="M ${centerX - SvgFigureDefine.CIRCLE_R} ${centerY} ` +   // 描画開始位置指定
      `L ${centerX} ${centerY - SvgFigureDefine.CIRCLE_R} ` +                 // 上弦描画
      `L ${centerX} ${centerY + SvgFigureDefine.CIRCLE_R} ` +                 // 縦線描画
      `Z" ` +                                                                 // パスを閉じる
      `stroke="black" fill="fuchsia" />` +
      `${SvgFigureDefine.LINE_BREAK}`;
  }

  /**
   * 関数からの出力を意味する図形を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @returns 図形のSVG文字列
   */
  static svgDataFuncOut(centerX: number, centerY: number): string {
    return `<path d="M ${centerX + SvgFigureDefine.CIRCLE_R} ${centerY} ` +   // 描画開始位置指定
      `L ${centerX} ${centerY - SvgFigureDefine.CIRCLE_R} ` +                 // 上弦描画
      `L ${centerX} ${centerY + SvgFigureDefine.CIRCLE_R} ` +                 // 縦線描画
      `Z" ` +                                                                 // パスを閉じる
      `stroke="black" fill="aqua" />` +
      `${SvgFigureDefine.LINE_BREAK}`;
  }

  /**
   * 処理を意味する行を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @param text 行の文字列
   * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
   */
  static drawFigureNormal(
    centerX: number,
    centerY: number,
    text: string = "",
  ): [number, string] {
    // 円の描画
    const svgCircleText = this.svgCircle(centerX, centerY, SvgFigureDefine.CIRCLE_R);

    // 文字列の描画
    const startX = centerX + SvgFigureDefine.CIRCLE_R + SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
    const [endX, svgStringText] = SvgFigureText.drawString(startX, centerY, text);

    // 終端位置とSVG文字列を返す
    const svgText = svgCircleText + svgStringText;
    return [endX, svgText];
  }

  /**
   * 円に内接する正多角形の頂点座標を取得する
   * 
   * @param numOfVertex 頂点の数
   * @param centerX 円の中心となるX座標
   * @param centerY 円の中心となるY座標
   * @param radius 円の半径
   * @param rotation 正多角形を回転させたい角度(ラジアン)
   * @returns 正多角形の頂点座標をタプル[x,y]の配列で返す
   */
  static getVerticesPolygon(
    numOfVertex: number,
    centerX: number,
    centerY: number,
    radius: number,
    rotation: number = 0
  ): [number, number][] {
    const vertices: [number, number][] = [];
    for (let vertex = 0; vertex < numOfVertex; vertex++) {
      const angle = rotation + vertex * (2 * Math.PI / numOfVertex);
      const x = Math.round(centerX + radius * Math.cos(angle));
      const y = Math.round(centerY + radius * Math.sin(angle));
      vertices.push([x, y]);
    }

    return vertices;
  }

  /**
   * 条件分岐を意味する行を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @param text 行の文字列
   * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
   */
  static drawFigureFork(
    centerX: number,
    centerY: number,
    text: string = "",
  ): [number, string] {
    // 円の描画
    const svgCircleText = this.svgCircle(centerX, centerY, SvgFigureDefine.CIRCLE_R);

    // 正三角形の描画
    const vertices = this.getVerticesPolygon(3, centerX, centerY, SvgFigureDefine.CIRCLE_R - 2, 0);
    const svgTriangleText = this.svgTriangle(vertices);

    // 文字列の描画
    const startX = centerX + SvgFigureDefine.CIRCLE_R + SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
    const [endX, svgStringText] = SvgFigureText.drawString(startX, centerY, text);

    // 終端位置とSVG文字列を返す
    const svgText = svgCircleText + svgTriangleText + svgStringText;
    return [endX, svgText];
  }

  /**
   * 繰り返しを意味する行を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @param text 行の文字列
   * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
   */
  static drawFigureRepeat(
    centerX: number,
    centerY: number,
    text: string = ""
  ): [number, string] {
    // 円の描画
    const svgCircleText = this.svgCircle(centerX, centerY, SvgFigureDefine.CIRCLE_R);

    // 繰り返し記号の描画
    const svgArcArrowRText = this.svgArcArrowR(centerX, centerY);

    // 文字列の描画
    const startX = centerX + SvgFigureDefine.CIRCLE_R + SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
    const [endX, svgStringText] = SvgFigureText.drawString(startX, centerY, text);

    // 終端位置とSVG文字列を返す
    const svgText = svgCircleText + svgArcArrowRText + svgStringText;
    return [endX, svgText];
  }

  /**
   * 関数呼び出しを意味する行を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @param text 行の文字列
   * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
   */
  static drawFigureMod(
    centerX: number,
    centerY: number,
    text: string = "",
  ): [number, string] {
    // 円の描画
    const svgCircleText = this.svgCircle(centerX, centerY, SvgFigureDefine.CIRCLE_R);

    // 内側の円の描画
    const innerRadius = Math.floor(SvgFigureDefine.CIRCLE_R / 2);
    const svgInnerCircleText = this.svgCircle(centerX, centerY, innerRadius);

    // 文字列の描画
    const startX = centerX + SvgFigureDefine.CIRCLE_R + SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
    const [endX, svgStringText] = SvgFigureText.drawString(startX, centerY, text);

    // 終端位置とSVG文字列を返す
    const svgText = svgCircleText + svgInnerCircleText + svgStringText;
    return [endX, svgText];
  }

  /**
   * 脱出(return/break)を意味する行を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @param text 行の文字列
   * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
   */
  static drawFigureReturn(
    centerX: number,
    centerY: number,
    text: string = ""
  ): [number, string] {
    // 上部の垂直線
    const vLineTop = centerY - SvgFigureDefine.CIRCLE_R;
    const svgLineVText = SvgFigureLines.drawLineV(centerX, vLineTop, SvgFigureDefine.CIRCLE_R);

    // 正三角形の描画
    const vertices = this.getVerticesPolygon(3, centerX, centerY, SvgFigureDefine.CIRCLE_R, (Math.PI / 2));
    const svgTriangleText = this.svgTriangle(vertices);

    // 下部の水平線
    const triangleLeft = centerX - SvgFigureDefine.CIRCLE_R;
    const hLineBottom = centerY + SvgFigureDefine.CIRCLE_R;
    const svgLineHText = SvgFigureLines.drawLineH(triangleLeft, hLineBottom, SvgFigureDefine.FIGURE_WIDTH);

    // 文字列の描画
    const startX = centerX + SvgFigureDefine.CIRCLE_R + SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
    const [endX, svgStringText] = SvgFigureText.drawString(startX, centerY, text);

    // 終端位置とSVG文字列を返す
    const svgText = svgLineVText + svgTriangleText + svgLineHText + svgStringText;
    return [endX, svgText];
  }

  /**
   * 条件を意味する行を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @param text 行の文字列
   * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
   */
  static drawFigureCond(
    centerX: number,
    centerY: number,
    text: string = "",
  ): [number, string] {
    // 上部の垂直線
    const vLineTop = centerY - SvgFigureDefine.CIRCLE_R;
    const svgLineVText = SvgFigureLines.drawLineV(centerX, vLineTop, SvgFigureDefine.FIGURE_HEIGHT);

    // レベルシフトの右矢印
    const svgArrowRText = SvgFigureLines.drawArrowR(centerX, vLineTop, SvgFigureDefine.TEXT_MARGIN);

    // 文字列の描画
    const startX = centerX + SvgFigureDefine.CIRCLE_R + SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
    const [endX, svgStringText] = SvgFigureText.drawString(startX, centerY, text);

    // 終端位置とSVG文字列を返す
    const svgText = svgLineVText + svgArrowRText + svgStringText;
    return [endX, svgText];
  }

  /**
   * 条件(真)を意味する行を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @param text 行の文字列
   * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
   */
  static drawFigureTrue(
    centerX: number,
    centerY: number,
    text: string = "",
  ): [number, string] {
    const textCond = "(true) " + text;
    return this.drawFigureCond(centerX, centerY, textCond);
  }

  /**
   * 条件(偽)を意味する行を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @param text 行の文字列
   * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
   */
  static drawFigureFalse(
    centerX: number,
    centerY: number,
    text: string = "",
  ): [number, string] {
    const textCond = "(false) " + text;
    return this.drawFigureCond(centerX, centerY, textCond);
  }

  /**
   * 条件(複数)を意味する行を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @param text 行の文字列
   * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
   */
  static drawFigureBranch(
    centerX: number,
    centerY: number,
    text: string = "",
  ): [number, string] {
    const textCond = "(" + text + ")";
    return this.drawFigureCond(centerX, centerY, textCond);
  }

  /**
   * データ部を意味する行を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @param text 行の文字列
   * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
   */
  static drawFigureData(
    centerX: number,
    centerY: number,
    text: string = "",
  ): [number, string] {
    // 四角の描画
    const svgRectText = this.svgRect(centerX, centerY);

    // 文字列の描画
    const startX = centerX + SvgFigureDefine.CIRCLE_R + SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
    const [endX, svgStringText] = SvgFigureText.drawString(startX, centerY, text);

    // 終端位置とSVG文字列を返す
    const svgText = svgRectText + svgStringText;
    return [endX, svgText];
  }

  /**
   * 関数への入力を意味する図形を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @returns 図形のSVG文字列
   */
  static drawFigureDataFuncIn(centerX: number, centerY: number): string {
    return this.svgDataFuncIn(centerX, centerY);
  }

  /**
   * 関数からの出力を意味する図形を描画する
   * 
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @returns 図形のSVG文字列
   */
  static drawFigureDataFuncOut(centerX: number, centerY: number): string {
    return this.svgDataFuncOut(centerX, centerY);
  }
}
