
export class SvgContent {
  private _name: string;
  private _text_content: string[];
  private _svg_content: string;
  constructor(name: string) {
    this._name = name;
    this._text_content = [];
    this._svg_content = "";
  }

  setTextContent(sourceTexts: string[]): void {
    this._text_content = sourceTexts;
  }

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

  private getSvgContent(): string {
    return `
      <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#808d81"/>
        <text x=5 y=10 text-anchor="start" dominant-baseline="middle" font-family="Consolas, Courier New, monospace" font-size="12">${this._name}</text>
        <text x=10 y=25 text-anchor="start" dominant-baseline="middle" font-family="Consolas, Courier New, monospace" font-size="12">${this._text_content[0]}</text>
      </svg>
    `;
  }
}
