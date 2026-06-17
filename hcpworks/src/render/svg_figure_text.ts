import { SvgFigureDefine } from './svg_figure_define';

/** 文字列装飾の種別。'' は装飾なし。 */
export type DecorationKind = '' | 'del' | 'ins';

/** 装飾セグメント(連続する同一装飾の範囲) */
export interface DecorationSegment {
  text: string;
  deco: DecorationKind;
}

/** 装飾解析の結果 */
export interface DecorationParseResult {
  segments: DecorationSegment[];
  /** 記法エラー(入れ子・対応しない閉じタグ・閉じ忘れ等)を検出したか */
  error: boolean;
}

export class SvgFigureText {
  /** 装飾タグ(開始/終了)にマッチする正規表現 */
  private static readonly DECORATION_TAG_REGEX = /<\/?(?:del|ins)>/g;

  /**
   * 文字列を装飾(<del>/<ins>)の有無でセグメントに分割する。
   *
   * 各タグは対(<del></del>, <ins></ins>)で利用する想定。
   * 以下は記法エラーとして error=true を返す。
   * - 装飾の途中に別の開始タグが現れる(入れ子/別タグ混入)
   * - 開いている装飾と対応しない閉じタグが現れる
   * - 閉じタグが無いまま文字列が終わる(閉じ忘れ)
   *
   * @param text 元の文字列
   * @returns セグメント配列とエラー有無
   */
  static parseDecorationSegments(text: string): DecorationParseResult {
    const segments: DecorationSegment[] = [];
    if (!text) { return { segments, error: false }; }

    const regex = new RegExp(SvgFigureText.DECORATION_TAG_REGEX.source, 'g');
    let openDeco: DecorationKind = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const tag = match[0];
      const isClose = tag[1] === '/';
      const name = (isClose ? tag.slice(2, -1) : tag.slice(1, -1)) as DecorationKind;

      // タグ直前までのテキストを、現在開いている装飾として確定する
      if (match.index > lastIndex) {
        segments.push({ text: text.slice(lastIndex, match.index), deco: openDeco });
      }
      lastIndex = regex.lastIndex;

      if (!isClose) {
        // 開始タグ: 既に別(または同一)の装飾が開いていれば入れ子エラー
        if (openDeco !== '') { return { segments, error: true }; }
        openDeco = name;
      } else {
        // 閉じタグ: 開いている装飾と一致しなければエラー
        if (openDeco !== name) { return { segments, error: true }; }
        openDeco = '';
      }
    }

    // 閉じ忘れ(装飾が開きっぱなし)はエラー
    if (openDeco !== '') { return { segments, error: true }; }

    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), deco: '' });
    }
    return { segments, error: false };
  }

  /**
   * 文字列から、実際に描画される表示文字列を取得する。
   * - 正常時: 装飾タグを取り除いた文字列
   * - エラー時: タグを含む元の文字列(エラーを可視化するためタグごと表示する)
   *
   * 幅計算を表示内容に一致させるために用いる。
   *
   * @param text 元の文字列
   * @returns 表示される文字列
   */
  static getDecorationDisplayText(text: string): string {
    if (!text) { return ''; }
    const { segments, error } = SvgFigureText.parseDecorationSegments(text);
    if (error) { return text; }
    return segments.map((seg) => seg.text).join('');
  }

  /**
   * 装飾タグ(<del>/<ins>の開始・終了いずれか)を含むかどうかを返す。
   *
   * @param text 判定したい文字列
   * @returns 含む場合 true
   */
  static hasDecorationTag(text: string): boolean {
    if (!text) { return false; }
    return new RegExp(SvgFigureText.DECORATION_TAG_REGEX.source).test(text);
  }

  /**
   * 装飾種別に対応する描画設定を返す。
   *
   * @param deco 装飾種別('del' | 'ins')
   * @returns 取り消し線の有無と背景色
   */
  private static getDecorationStyle(deco: 'del' | 'ins'): { strike: boolean; bgColor: string } {
    if (deco === 'del') {
      return { strike: true, bgColor: SvgFigureDefine.STRIKE_BG_COLOR };
    }
    return { strike: false, bgColor: SvgFigureDefine.INSERT_BG_COLOR };
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

    // 装飾タグは表示されないので、表示文字列に対して幅を計算する
    text = SvgFigureText.getDecorationDisplayText(text);

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
   *   装飾背景など、実描画グリフに寄せたい場合に詰めた値を渡す。
   * @returns テキスト図形の幅(px)。端数は切り上げ。
   */
  static getSvgStringWidth(
    text: string,
    fontPx: number,
    halfWidthRatio: number = SvgFigureDefine.HALF_WIDTH_CHAR_RATIO
  ): number {
    if (!text) { return 0; }
    if (fontPx <= 0) { return 0; }

    // 装飾タグは表示されないので、表示文字列に対して幅を計算する
    text = SvgFigureText.getDecorationDisplayText(text);

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
   * 背景の<rect>文字列を生成する。
   * 幅は実描画グリフに寄せた比率で計算し、右端のはみ出しを抑える。
   *
   * @param startX 背景の開始X座標
   * @param startY テキスト中心のY座標
   * @param segText 背景を敷く対象の文字列
   * @param fontPx フォントサイズ(px)
   * @param bgColor 背景色
   * @returns <rect>のSVG文字列
   */
  private static svgBackgroundRect(
    startX: number,
    startY: number,
    segText: string,
    fontPx: number,
    bgColor: string
  ): string {
    const bgWidth = SvgFigureText.getSvgStringWidth(
      segText, fontPx, SvgFigureDefine.DECORATION_BG_HALF_WIDTH_RATIO
    );
    return `<rect x="${startX}" y="${startY - fontPx / 2}" ` +
      `width="${bgWidth}" height="${fontPx}" ` +
      `fill="${bgColor}" />` +
      `${SvgFigureDefine.LINE_BREAK}`;
  }

  /**
   * <text>要素のSVG文字列を生成する。
   *
   * @param startX 開始X座標
   * @param startY 中心Y座標
   * @param fontPx フォントサイズ(px)
   * @param inner <text>の内側(エスケープ済みテキストや<tspan>群)
   * @returns <text>のSVG文字列
   */
  private static svgTextElement(
    startX: number,
    startY: number,
    fontPx: number,
    inner: string
  ): string {
    return `<text x="${startX}" y="${startY}" ` +
      `text-anchor="start" dominant-baseline="middle" ` +
      `font-family="Consolas, Courier New, monospace" ` +
      `font-size="${fontPx}px">${inner}</text>` +
      `${SvgFigureDefine.LINE_BREAK}`;
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

    // 装飾記法を含まない場合は従来通り単純に描画する
    if (!SvgFigureText.hasDecorationTag(text)) {
      return SvgFigureText.svgTextElement(
        startX, startY, fontSizePx, SvgFigureText.escapeXml(text)
      );
    }

    const { segments, error } = SvgFigureText.parseDecorationSegments(text);

    // 記法エラー時は、タグを含む生テキストを赤背景で描画してエラーを明示する
    if (error) {
      const rect = SvgFigureText.svgBackgroundRect(
        startX, startY, text, fontSizePx, SvgFigureDefine.DECORATION_ERROR_BG_COLOR
      );
      const textEl = SvgFigureText.svgTextElement(
        startX, startY, fontSizePx, SvgFigureText.escapeXml(text)
      );
      return rect + textEl;
    }

    // 装飾記法を含む場合は、セグメント単位で<tspan>と背景<rect>を生成する
    let rects = '';
    let tspans = '';
    let offsetX = 0;
    for (const seg of segments) {
      if (!seg.text) { continue; }

      // セグメントの配置(offsetX)はレイアウト用の比率で揃える(矢印位置と同基準)
      const segWidth = SvgFigureText.getSvgStringWidth(seg.text, fontSizePx);
      const escaped = SvgFigureText.escapeXml(seg.text);
      if (seg.deco === '') {
        tspans += escaped;
      } else {
        const style = SvgFigureText.getDecorationStyle(seg.deco);
        // 背景<rect>を敷く(<del>:サーモンピンク / <ins>:ライトグリーン)
        rects += SvgFigureText.svgBackgroundRect(
          startX + offsetX, startY, seg.text, fontSizePx, style.bgColor
        );
        // <del>のみ取り消し線を引く。<ins>は背景のみ。
        tspans += style.strike
          ? `<tspan text-decoration="line-through">${escaped}</tspan>`
          : escaped;
      }
      offsetX += segWidth;
    }

    // 背景<rect>はテキストより先に描画して背面に配置する
    return rects + SvgFigureText.svgTextElement(startX, startY, fontSizePx, tspans);
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
