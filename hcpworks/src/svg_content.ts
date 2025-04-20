/**
 * SVGコンテンツを管理する
 * 
 * このクラスはSVG要素の名前、変換元のテキスト、変換後のSVGを管理します。
 */
export class SvgContent {
  private _name: string;
  private _textContent: string[];
  private _svgContent: string;

  /**
   * SvgContentクラスの新しいインスタンスを作成する
   */
  constructor() {
    this._name = "";
    this._textContent = [];
    this._svgContent = "";
  }

  /**
   * SVG要素の名前を設定する
   * 
   * @param name - 設定する名前
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  setName(name: string): SvgContent {
    this._name = name;
    return this;
  }

  /**
   * SVG要素の名前を取得する
   * 
   * @returns SVG要素の名前
   */
  getName(): string {
    return this._name;
  }

  /**
   * SVG要素の変換元となるテキストを設定する
   * 
   * @param sourceTexts - 設定するテキストコンテンツの配列
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  setTextContent(sourceTexts: string[]): SvgContent {
    this._textContent = sourceTexts;
    return this;
  }

  /**
   * SVG要素の変換元となるテキストを取得する
   * 
   * @returns テキストコンテンツの配列
   */
  getTextContent(): string[] {
    return this._textContent;
  }

  /**
   * HTMLコンテンツを取得する
   * 
   * @returns HTMLコンテンツ
   */
  getHtmlWrappedSvg(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HCP Preview</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            overflow-x: auto;
            overflow-y: auto;
          }

          .svg-container {
            // コンテナの幅を明示的に設定せず、SVGが自然なサイズを持てるようにする
            display: inline-block;
            min-width: min-content;
          }

          svg {
            display: block; // SVGをブロック要素として表示
          }
        </style>
      </head>
      <body>
      <div class="svg-container">
        ${this._svgContent}
      </div>
      </body>
      </html>
    `;
  }

  /**
   * SVGコンテンツを設定する
   * 
   * @param svgContent - 設定するSVGコンテンツ
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  setSvgContent(svgContent: string): SvgContent {
    this._svgContent = svgContent;
    return this;
  }

  /**
   * SVGコンテンツを取得する
   * 
   * @returns SVGコンテンツ
   */
  private getSvgContent(): string {
    return this._svgContent;
  }
}
