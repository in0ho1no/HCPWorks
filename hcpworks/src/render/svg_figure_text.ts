import { SvgFigureDefine } from './svg_figure_define';

export class SvgFigureText {
  /** 見え消し(取り消し線)記法の開始/終了タグ */
  static readonly STRIKE_TAG_OPEN = '<del>';
  static readonly STRIKE_TAG_CLOSE = '</del>';

  /**
   * 見え消し記法(<del>～</del>)を取り除いた、純粋な表示文字列を返す。
   * 幅計算は表示文字数で行う必要があるため、タグを除去してから計算する。
   *
   * @param text 元の文字列
   * @returns タグを除去した文字列
   */
  static stripStrikeTags(text: string): string {
    if (!text) { return ''; }
    return text.replace(/<\/?del>/g, '');
  }

  /**
   * 文字列を見え消し(取り消し線)の有無でセグメントに分割する。
   * <del>～</del>で囲まれた範囲は strike=true となる。
   *
   * @param text 元の文字列
   * @returns セグメントの配列(出現順)
   */
  static splitStrikeSegments(text: string): { text: string; strike: boolean }[] {
    if (!text) { return []; }

    const segments: { text: string; strike: boolean }[] = [];
    const regex = /<del>([\s\S]*?)<\/del>/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: text.slice(lastIndex, match.index), strike: false });
      }
      segments.push({ text: match[1], strike: true });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), strike: false });
    }
    return segments;
  }

  /**
   * 文字列の幅を全角文字単位で計算する
   * 2バイト文字を基準に積算する
   * 1バイト文字は、0.5文字扱いとする
   *
   * @param text 幅を取得したい文字列
   * @returns 文字列の幅(全角文字単位)。端数は切り上げ。
   */
  static calcStringWidth(text: string): number {
    if (!text) { return 0; }

    // 見え消しタグは表示されないので、幅計算からは除外する
    text = SvgFigureText.stripStrikeTags(text);

    let countBytes = 0;
    for (const char of text) {
      // ASCII文字(1バイト文字)
      if (char.charCodeAt(0) < 128) {
        countBytes += 0.5;
      } else {
        // それ以外(2バイト文字)
        countBytes += 1.0;
      }
    }
    return Math.ceil(countBytes);
  }

  /**
   * テキスト図形の幅をピクセル単位で取得する
   *
   * 全角文字単位への丸め(切り上げ)を経由せず、文字種ごとにpxを直接積算する。
   * これにより半角文字が連続したときの過小評価(矢印と末尾文字の重なり)を防ぐ。
   *
   * @param text 幅を取得したいテキスト図形の文字列
   * @param fontPx テキスト図形のフォントサイズ(px)
   * @param halfWidthRatio 半角文字の送り幅比率。省略時はレイアウト用の既定値。
   *   見え消し背景など、実描画グリフに寄せたい場合に詰めた値を渡す。
   * @returns テキスト図形の幅(px)。端数は切り上げ。
   */
  static getSvgStringWidth(
    text: string,
    fontPx: number,
    halfWidthRatio: number = SvgFigureDefine.HALF_WIDTH_CHAR_RATIO
  ): number {
    if (!text) { return 0; }
    if (fontPx <= 0) { return 0; }

    // 見え消しタグは表示されないので、幅計算からは除外する
    text = SvgFigureText.stripStrikeTags(text);

    let widthPx = 0;
    for (const char of text) {
      // ASCII文字(1バイト文字)
      if (char.charCodeAt(0) < 128) {
        widthPx += fontPx * halfWidthRatio;
      } else {
        // それ以外(2バイト文字)
        widthPx += fontPx * SvgFigureDefine.FULL_WIDTH_CHAR_RATIO;
      }
    }
    return Math.ceil(widthPx);
  }

  /**
   * 指定した倍率のフォントサイズを取得する
   * 
   * @param fontSizePercent フォントサイズの倍率 何も指定しなければ100%(1倍)扱い
   * @returns フォントサイズ(px)
   */
  static getFontSizePx(fontSizePercent: number = 100): number {
    if (fontSizePercent <= 0) { return SvgFigureDefine.FONT_SIZE_PX; }

    return Math.floor(SvgFigureDefine.FONT_SIZE_PX * (fontSizePercent / 100));
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
  static svgString(
    startX: number,
    startY: number,
    text: string,
    fontSizePercent: number = 100
  ): string {
    if (!text) { return ''; }

    const fontSizePx = SvgFigureText.getFontSizePx(fontSizePercent);

    // 見え消し(取り消し線)記法を含まない場合は従来通り単純に描画する
    if (!text.includes(SvgFigureText.STRIKE_TAG_OPEN)) {
      const escapedText = SvgFigureText.escapeXml(text);
      return `<text x="${startX}" y="${startY}" ` +
        `text-anchor="start" dominant-baseline="middle" ` +
        `font-family="Consolas, Courier New, monospace" ` +
        `font-size="${fontSizePx}px">${escapedText}</text>` +
        `${SvgFigureDefine.LINE_BREAK}`;
    }

    // 見え消し記法を含む場合は、セグメント単位で<tspan>と背景<rect>を生成する
    const segments = SvgFigureText.splitStrikeSegments(text);
    let rects = '';
    let tspans = '';
    let offsetX = 0;
    for (const seg of segments) {
      if (!seg.text) { continue; }

      // セグメントの配置(offsetX)はレイアウト用の比率で揃える(矢印位置と同基準)
      const segWidth = SvgFigureText.getSvgStringWidth(seg.text, fontSizePx);
      const escaped = SvgFigureText.escapeXml(seg.text);
      if (seg.strike) {
        // 背景rectの幅だけは実描画グリフに寄せた比率で計算し、右端のはみ出しを抑える
        const bgWidth = SvgFigureText.getSvgStringWidth(
          seg.text, fontSizePx, SvgFigureDefine.STRIKE_BG_HALF_WIDTH_RATIO
        );
        // 見え消し対象: 背景(サーモンピンク)を敷き、取り消し線を引く
        rects += `<rect x="${startX + offsetX}" y="${startY - fontSizePx / 2}" ` +
          `width="${bgWidth}" height="${fontSizePx}" ` +
          `fill="${SvgFigureDefine.STRIKE_BG_COLOR}" />` +
          `${SvgFigureDefine.LINE_BREAK}`;
        tspans += `<tspan text-decoration="line-through">${escaped}</tspan>`;
      } else {
        tspans += escaped;
      }
      offsetX += segWidth;
    }

    // 背景<rect>はテキストより先に描画して背面に配置する
    return rects +
      `<text x="${startX}" y="${startY}" ` +
      `text-anchor="start" dominant-baseline="middle" ` +
      `font-family="Consolas, Courier New, monospace" ` +
      `font-size="${fontSizePx}px">${tspans}</text>` +
      `${SvgFigureDefine.LINE_BREAK}`;
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
  static drawString(
    startX: number,
    startY: number,
    text: string,
    fontSizePercent: number = 100
  ): [number, string] {
    if (!text) {
      return [startX, ''];
    }

    const fontSizePx: number = SvgFigureText.getFontSizePx(fontSizePercent);
    const textWidth: number = SvgFigureText.getSvgStringWidth(text, fontSizePx);
    const svgText: string = SvgFigureText.svgString(startX, startY, text, fontSizePercent);

    // 終端位置とSVG文字列を返す
    const endX = startX + textWidth + SvgFigureDefine.TEXT_MARGIN;
    return [endX, svgText];
  }

  /**
   * XMLで特殊文字となる文字をエスケープする
   * 
   * @param text エスケープしたい文字列
   * @returns エスケープされた文字列
   */
  static escapeXml(text: string): string {
    if (!text) { return ''; }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
