"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgFigureParts = void 0;
const svg_figure_define_1 = require("./svg_figure_define");
const svg_figure_text_1 = require("./svg_figure_text");
const svg_figure_line_1 = require("./svg_figure_line");
class SvgFigureParts {
    /**
     * 基本的な円を描画する
     *
     * @param centerX 中心X座標
     * @param centerY 中心Y座標
     * @param radius 円の半径
     * @returns 円のSVG文字列
     */
    static svgCircle(centerX, centerY, radius) {
        return `<circle cx="${centerX}" cy="${centerY}" ` +
            `r="${radius}" fill="#FFFFFF" stroke="#000000"/>` +
            `${svg_figure_define_1.SvgFigureDefine.LINE_BREAK}`;
    }
    /**
     * 基本的な三角形を描画する
     *
     * @param vertices 三角形の頂点座標
     * @returns 三角形のSVG文字列
     */
    static svgTriangle(vertices) {
        return `<polygon points="` +
            `${vertices[0][0]} ${vertices[0][1]} ` +
            `${vertices[1][0]} ${vertices[1][1]} ` +
            `${vertices[2][0]} ${vertices[2][1]}" ` +
            `fill="#FFFFFF" stroke="#000000"/>` +
            `${svg_figure_define_1.SvgFigureDefine.LINE_BREAK}`;
    }
    /**
     * 右巻き矢印を描画する
     *
     * @param centerX 中心X座標
     * @param centerY 中心Y座標
     * @returns 右巻き矢印のSVG文字列
     */
    static svgArcArrowR(centerX, centerY) {
        const radius = svg_figure_define_1.SvgFigureDefine.CIRCLE_R - Math.floor(svg_figure_define_1.SvgFigureDefine.CIRCLE_R / 2); // 半径
        const startX = centerX;
        const startY = centerY - radius;
        const endX = centerX;
        const endY = centerY + radius;
        const xAxisRotation = 0; // 公式ドキュメントでも0固定
        const largeArcFlag = 0; // 半円なので0固定
        const sweepFlag = 1; // 右周りの指定なので1
        const svgArcText = `<path d="` +
            `M ${startX} ${startY} ` + // 始点へ移動
            `A ${radius} ${radius}, ` + // X軸方向・Y軸方向の半径
            `${xAxisRotation} ${largeArcFlag} ${sweepFlag} ` +
            `${endX} ${endY}" ` + // 終点
            `stroke="#000000" fill="transparent"/>` +
            `${svg_figure_define_1.SvgFigureDefine.LINE_BREAK}`;
        const svgArrowText = `<path d="` +
            `M ${endX} ${endY} L ${endX + 2} ${endY - 4} ` + // 始点へ移動して、描画
            `L ${endX + 4} ${endY + 0.5} Z" ` + // パスを閉じる
            `stroke="#000000" fill="#000000"/>` +
            `${svg_figure_define_1.SvgFigureDefine.LINE_BREAK}`;
        return svgArcText + svgArrowText;
    }
    /**
     * 基本的な四角を描画する
     *
     * @param centerX 中心X座標
     * @param centerY 中心Y座標
     * @returns 四角のSVG文字列
     */
    static svgRect(centerX, centerY) {
        return `<rect ` +
            `x="${centerX - svg_figure_define_1.SvgFigureDefine.CIRCLE_R}" y="${centerY - svg_figure_define_1.SvgFigureDefine.CIRCLE_R}" ` +
            `width="${svg_figure_define_1.SvgFigureDefine.FIGURE_WIDTH}" height="${svg_figure_define_1.SvgFigureDefine.FIGURE_HEIGHT}" ` +
            `fill="#FFFFFF" stroke="#000000"/>` +
            `${svg_figure_define_1.SvgFigureDefine.LINE_BREAK}`;
    }
    /**
     * 関数への入力を意味する図形を描画する
     *
     * @param centerX 中心X座標
     * @param centerY 中心Y座標
     * @returns 図形のSVG文字列
     */
    static svgDataFuncIn(centerX, centerY) {
        return `<path d="M ${centerX - svg_figure_define_1.SvgFigureDefine.CIRCLE_R} ${centerY} ` + // 描画開始位置指定
            `L ${centerX} ${centerY - svg_figure_define_1.SvgFigureDefine.CIRCLE_R} ` + // 上弦描画
            `L ${centerX} ${centerY + svg_figure_define_1.SvgFigureDefine.CIRCLE_R} ` + // 縦線描画
            `Z" ` + // パスを閉じる
            `stroke="#000000" fill="#ff00ff" />` +
            `${svg_figure_define_1.SvgFigureDefine.LINE_BREAK}`;
    }
    /**
     * 関数からの出力を意味する図形を描画する
     *
     * @param centerX 中心X座標
     * @param centerY 中心Y座標
     * @returns 図形のSVG文字列
     */
    static svgDataFuncOut(centerX, centerY) {
        return `<path d="M ${centerX + svg_figure_define_1.SvgFigureDefine.CIRCLE_R} ${centerY} ` + // 描画開始位置指定
            `L ${centerX} ${centerY - svg_figure_define_1.SvgFigureDefine.CIRCLE_R} ` + // 上弦描画
            `L ${centerX} ${centerY + svg_figure_define_1.SvgFigureDefine.CIRCLE_R} ` + // 縦線描画
            `Z" ` + // パスを閉じる
            `stroke="#000000" fill="#00ffff" />` +
            `${svg_figure_define_1.SvgFigureDefine.LINE_BREAK}`;
    }
    /**
     * 処理を意味する行を描画する
     *
     * @param centerX 中心X座標
     * @param centerY 中心Y座標
     * @param text 行の文字列
     * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
     */
    static drawFigureNormal(centerX, centerY, text = "") {
        // 円の描画
        const svgCircleText = SvgFigureParts.svgCircle(centerX, centerY, svg_figure_define_1.SvgFigureDefine.CIRCLE_R);
        // 文字列の描画
        const startX = centerX + svg_figure_define_1.SvgFigureDefine.CIRCLE_R + svg_figure_define_1.SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
        const [endX, svgStringText] = svg_figure_text_1.SvgFigureText.drawString(startX, centerY, text);
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
    static getVerticesPolygon(numOfVertex, centerX, centerY, radius, rotation = 0) {
        const vertices = [];
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
    static drawFigureFork(centerX, centerY, text = "") {
        // 円の描画
        const svgCircleText = SvgFigureParts.svgCircle(centerX, centerY, svg_figure_define_1.SvgFigureDefine.CIRCLE_R);
        // 正三角形の描画
        const vertices = SvgFigureParts.getVerticesPolygon(3, centerX, centerY, svg_figure_define_1.SvgFigureDefine.CIRCLE_R - 2, 0);
        const svgTriangleText = SvgFigureParts.svgTriangle(vertices);
        // 文字列の描画
        const startX = centerX + svg_figure_define_1.SvgFigureDefine.CIRCLE_R + svg_figure_define_1.SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
        const [endX, svgStringText] = svg_figure_text_1.SvgFigureText.drawString(startX, centerY, text);
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
    static drawFigureRepeat(centerX, centerY, text = "") {
        // 円の描画
        const svgCircleText = SvgFigureParts.svgCircle(centerX, centerY, svg_figure_define_1.SvgFigureDefine.CIRCLE_R);
        // 繰り返し記号の描画
        const svgArcArrowRText = SvgFigureParts.svgArcArrowR(centerX, centerY);
        // 文字列の描画
        const startX = centerX + svg_figure_define_1.SvgFigureDefine.CIRCLE_R + svg_figure_define_1.SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
        const [endX, svgStringText] = svg_figure_text_1.SvgFigureText.drawString(startX, centerY, text);
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
    static drawFigureMod(centerX, centerY, text = "") {
        // 円の描画
        const svgCircleText = SvgFigureParts.svgCircle(centerX, centerY, svg_figure_define_1.SvgFigureDefine.CIRCLE_R);
        // 内側の円の描画
        const innerRadius = Math.floor(svg_figure_define_1.SvgFigureDefine.CIRCLE_R / 2);
        const svgInnerCircleText = SvgFigureParts.svgCircle(centerX, centerY, innerRadius);
        // 文字列の描画
        const startX = centerX + svg_figure_define_1.SvgFigureDefine.CIRCLE_R + svg_figure_define_1.SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
        const [endX, svgStringText] = svg_figure_text_1.SvgFigureText.drawString(startX, centerY, text);
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
    static drawFigureReturn(centerX, centerY, text = "") {
        // 上部の垂直線
        const vLineTop = centerY - svg_figure_define_1.SvgFigureDefine.CIRCLE_R;
        const svgLineVText = svg_figure_line_1.SvgFigureLines.drawLineV(centerX, vLineTop, svg_figure_define_1.SvgFigureDefine.CIRCLE_R);
        // 正三角形の描画
        const vertices = SvgFigureParts.getVerticesPolygon(3, centerX, centerY, svg_figure_define_1.SvgFigureDefine.CIRCLE_R, (Math.PI / 2));
        const svgTriangleText = SvgFigureParts.svgTriangle(vertices);
        // 下部の水平線
        const triangleLeft = centerX - svg_figure_define_1.SvgFigureDefine.CIRCLE_R;
        const hLineBottom = centerY + svg_figure_define_1.SvgFigureDefine.CIRCLE_R;
        const svgLineHText = svg_figure_line_1.SvgFigureLines.drawLineH(triangleLeft, hLineBottom, svg_figure_define_1.SvgFigureDefine.FIGURE_WIDTH);
        // 文字列の描画
        const startX = centerX + svg_figure_define_1.SvgFigureDefine.CIRCLE_R + svg_figure_define_1.SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
        const [endX, svgStringText] = svg_figure_text_1.SvgFigureText.drawString(startX, centerY, text);
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
    static drawFigureCond(centerX, centerY, text = "") {
        // 上部の垂直線
        const vLineTop = centerY - svg_figure_define_1.SvgFigureDefine.CIRCLE_R;
        const svgLineVText = svg_figure_line_1.SvgFigureLines.drawLineV(centerX, vLineTop, svg_figure_define_1.SvgFigureDefine.FIGURE_HEIGHT);
        // レベルシフトの右矢印
        const svgArrowRText = svg_figure_line_1.SvgFigureLines.drawArrowR(centerX, vLineTop, svg_figure_define_1.SvgFigureDefine.TEXT_MARGIN);
        // 文字列の描画
        const startX = centerX + svg_figure_define_1.SvgFigureDefine.CIRCLE_R + svg_figure_define_1.SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
        const [endX, svgStringText] = svg_figure_text_1.SvgFigureText.drawString(startX, centerY, text);
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
    static drawFigureTrue(centerX, centerY, text = "") {
        const textCond = "(true) " + text;
        return SvgFigureParts.drawFigureCond(centerX, centerY, textCond);
    }
    /**
     * 条件(偽)を意味する行を描画する
     *
     * @param centerX 中心X座標
     * @param centerY 中心Y座標
     * @param text 行の文字列
     * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
     */
    static drawFigureFalse(centerX, centerY, text = "") {
        const textCond = "(false) " + text;
        return SvgFigureParts.drawFigureCond(centerX, centerY, textCond);
    }
    /**
     * 条件(複数)を意味する行を描画する
     *
     * @param centerX 中心X座標
     * @param centerY 中心Y座標
     * @param text 行の文字列
     * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
     */
    static drawFigureBranch(centerX, centerY, text = "") {
        const textCond = "(" + text + ")";
        return SvgFigureParts.drawFigureCond(centerX, centerY, textCond);
    }
    /**
     * データ部を意味する行を描画する
     *
     * @param centerX 中心X座標
     * @param centerY 中心Y座標
     * @param text 行の文字列
     * @returns [行の終端位置 , 処理を意味する行のSVG文字列]
     */
    static drawFigureData(centerX, centerY, text = "") {
        // 四角の描画
        const svgRectText = SvgFigureParts.svgRect(centerX, centerY);
        // 文字列の描画
        const startX = centerX + svg_figure_define_1.SvgFigureDefine.CIRCLE_R + svg_figure_define_1.SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
        const [endX, svgStringText] = svg_figure_text_1.SvgFigureText.drawString(startX, centerY, text);
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
    static drawFigureDataFuncIn(centerX, centerY) {
        return SvgFigureParts.svgDataFuncIn(centerX, centerY);
    }
    /**
     * 関数からの出力を意味する図形を描画する
     *
     * @param centerX 中心X座標
     * @param centerY 中心Y座標
     * @returns 図形のSVG文字列
     */
    static drawFigureDataFuncOut(centerX, centerY) {
        return SvgFigureParts.svgDataFuncOut(centerX, centerY);
    }
}
exports.SvgFigureParts = SvgFigureParts;
//# sourceMappingURL=svg_figure_parts.js.map