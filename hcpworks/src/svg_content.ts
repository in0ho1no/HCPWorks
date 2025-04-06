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
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
        </style>
      </head>
      <body>
        ${this.getSvgContent()}
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
    return `
      <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#808d81"/>
        <text x=5 y=10 text-anchor="start" dominant-baseline="middle" font-family="Consolas, Courier New, monospace" font-size="12">${this._name}</text>
        <text x=10 y=25 text-anchor="start" dominant-baseline="middle" font-family="Consolas, Courier New, monospace" font-size="12">${this._textContent[0]}</text>
      </svg>
    `;
  }
}
