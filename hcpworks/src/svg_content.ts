
export class SvgContent {
  private _name: string;
  private _org_text: string;
  private _svg_content: string;
  constructor(name: string) {
    this._name = name;
    this._org_text = "";
    this._svg_content = "";
  }

  setOrgText(text: string): void {
    this._org_text = text;
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
            background-color: #f5f5f5;
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
        <rect width="100%" height="100%" fill="#ffffff" stroke="#000000" stroke-width="2"/>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="32" font-weight="bold">${this._name}</text>
        <!-- fileContentに基づいて生成される追加のSVG要素をここに配置 -->
      </svg>
    `;
  }
}
