"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgFigureText = void 0;
const svg_figure_define_1 = require("./svg_figure_define");
class SvgFigureText {
    /**
     * 文字列の幅を計算する
     * 2バイト文字を基準に積算する
     * 1バイト文字は、0.5文字扱いとする
     *
     * @param text 幅を取得したい文字列
     * @returns 文字列の幅。端数は切り上げ。
     */
    static calcStringWidth(text) {
        if (!text) {
            return 0;
        }
        let countBytes = 0;
        for (const char of text) {
            // ASCII文字(1バイト文字)
            if (char.charCodeAt(0) < 128) {
                countBytes += 0.5;
            }
            else {
                // それ以外(2バイト文字)
                countBytes += 1.0;
            }
        }
        return Math.ceil(countBytes);
    }
    /**
     * テキスト図形の幅をピクセル単位で取得する
     *
     * @param text 幅を取得したいテキスト図形の文字列
     * @param fontPx テキスト図形のフォントサイズ(px)
     * @returns テキスト図形の幅(px)
     */
    static getSvgStringWidth(text, fontPx) {
        if (!text) {
            return 0;
        }
        if (fontPx <= 0) {
            return 0;
        }
        const stringWidth = SvgFigureText.calcStringWidth(text);
        return stringWidth * fontPx;
    }
    /**
     * 指定した倍率のフォントサイズを取得する
     *
     * @param fontSizePercent フォントサイズの倍率 何も指定しなければ100%(1倍)扱い
     * @returns フォントサイズ(px)
     */
    static getFontSizePx(fontSizePercent = 100) {
        if (fontSizePercent <= 0) {
            return svg_figure_define_1.SvgFigureDefine.FONT_SIZE_PX;
        }
        return Math.floor(svg_figure_define_1.SvgFigureDefine.FONT_SIZE_PX * (fontSizePercent / 100));
    }
    /**
     * テキスト図形のSVG文字列を生成する
     *
     * @param startX テキスト描画開始位置 X座標
     * @param startY テキスト描画開始位置 Y座標
     * @param text 描画テキスト
     * @param fontSizePercent フォントサイズの倍率 何も指定しなければ100%(1倍)扱い
     * @returns テキスト図形のSVG文字列
     */
    static svgString(startX, startY, text, fontSizePercent = 100) {
        if (!text) {
            return '';
        }
        const fontSizePx = SvgFigureText.getFontSizePx(fontSizePercent);
        // エスケープが必要な特殊文字の処理
        const escapedText = SvgFigureText.escapeXml(text);
        return `<text x="${startX}" y="${startY}" ` +
            `text-anchor="start" dominant-baseline="middle" ` +
            `font-family="Consolas, Courier New, monospace" ` +
            `font-size="${fontSizePx}px">${escapedText}</text>` +
            `${svg_figure_define_1.SvgFigureDefine.LINE_BREAK}`;
    }
    /**
     * テキスト図形のSVG文字列と終了位置を取得する
     *
     * @param startX テキスト描画開始位置 X座標 // TODO 呼び出し元で右記加算する SvgFigureDefine.CIRCLE_R + SvgFigureDefine.SPACE_FIGURE_TO_TEXT
     * @param startY テキスト描画開始位置 Y座標
     * @param text 描画テキスト
     * @param fontSizePercent フォントサイズの倍率 何も指定しなければ100%(1倍)扱い
     * @returns [終了位置のX座標, テキスト図形のSVG文字列]
     */
    static drawString(startX, startY, text, fontSizePercent = 100) {
        if (!text) {
            return [startX, ''];
        }
        const fontSizePx = SvgFigureText.getFontSizePx(fontSizePercent);
        const textWidth = SvgFigureText.getSvgStringWidth(text, fontSizePx);
        const svgText = SvgFigureText.svgString(startX, startY, text, fontSizePercent);
        // 終端位置とSVG文字列を返す
        const endX = startX + textWidth + svg_figure_define_1.SvgFigureDefine.TEXT_MARGIN;
        return [endX, svgText];
    }
    /**
     * XMLで特殊文字となる文字をエスケープする
     *
     * @param text エスケープしたい文字列
     * @returns エスケープされた文字列
     */
    static escapeXml(text) {
        if (!text) {
            return '';
        }
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
exports.SvgFigureText = SvgFigureText;
//# sourceMappingURL=svg_figure_text.js.map