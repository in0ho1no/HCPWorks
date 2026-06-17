import { TableData } from './parse/file_parse';

/**
 * SVGコンテンツを管理する
 *
 * このクラスはSVG要素の名前、変換元のテキスト、変換後のSVGを管理します。
 */
export class SvgContent {
  private _name: string;
  private _textContent: string[];
  private _svgContent: string;
  private _tables: TableData[];

  /**
   * SvgContentクラスの新しいインスタンスを作成する
   */
  constructor() {
    this._name = "";
    this._textContent = [];
    this._svgContent = "";
    this._tables = [];
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
   * 表データを設定する
   *
   * @param tables - 設定する表データの配列
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  setTables(tables: TableData[]): SvgContent {
    this._tables = tables;
    return this;
  }

  /**
   * 表データを取得する
   *
   * @returns 表データの配列
   */
  getTables(): TableData[] {
    return this._tables;
  }

  /**
   * HTMLとして安全に埋め込めるよう文字列をエスケープする
   *
   * @param text - エスケープ対象の文字列
   * @returns エスケープ済みの文字列
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * セルの文字列をHTMLへ変換する
   *
   * `<br>`(`<br/>` `<br />` 等)のみ改行として通し、それ以外はエスケープする。
   * セル内の改行はExcelへ「書式あり貼り付け」した際にセル内改行として扱われる。
   *
   * @param cell - セルの文字列
   * @returns 改行を反映したHTML文字列
   */
  private renderCellContent(cell: string): string {
    return cell
      .split(/<br\s*\/?>/i)
      .map(part => this.escapeHtml(part))
      .join("<br>");
  }

  /**
   * 保持している表データをHTMLの表へ変換する
   *
   * 先頭行をヘッダー(th)、残りをデータ行(td)として描画する。
   *
   * @returns 表のHTML文字列(表が無ければ空文字)
   */
  private getTablesHtml(): string {
    const tablesHtml = this._tables.map(table => {
      const captionHtml = table.caption
        ? `<caption>${this.escapeHtml(table.caption)}</caption>`
        : "";

      const rowsHtml = table.rows.map((row, rowIndex) => {
        const tag = rowIndex === 0 ? "th" : "td";
        const cellsHtml = row.cells.map((cell, cellIndex) => {
          let content = this.renderCellContent(cell);

          // 先頭列のみ、階層(depth)に応じて全角スペースで字下げする
          // CSSではなく実文字にすることで、Excelへ書式あり貼り付けしても字下げが残る
          if (cellIndex === 0 && row.depth > 0) {
            content = "　".repeat(row.depth) + content;
          }
          return `<${tag}>${content}</${tag}>`;
        }).join("");
        return `<tr>${cellsHtml}</tr>`;
      }).join("");

      return `<table class="hcp-table">${captionHtml}${rowsHtml}</table>`;
    }).join("");

    return tablesHtml;
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

            transform-origin: 0 0;
          }

          svg {
            display: block; // SVGをブロック要素として表示
          }

          .hcp-tables {
            padding: 8px;
          }

          .hcp-table {
            border-collapse: collapse;
            margin: 0 0 12px 0;
          }

          .hcp-table caption {
            text-align: left;
            font-weight: bold;
            padding: 4px 0;
          }

          .hcp-table th,
          .hcp-table td {
            border: 1px solid currentColor;
            padding: 4px 10px;
            text-align: left;
            white-space: nowrap;
          }

          .hcp-table th {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
      <div class="hcp-tables">
        ${this.getTablesHtml()}
      </div>
      <div class="svg-container" id="svgContainer">
        ${this._svgContent}
      </div>

      <script>
        // 初期ズームレベル
        let scale = 1;
        // 最小・最大ズームレベル
        const minScale = 0.1;
        const maxScale = 10;
        // スケーリング速度
        const scaleSpeed = 0.1;
        
        const container = document.getElementById('svgContainer');
        
        // マウスホイールイベントのリスナー
        document.addEventListener('wheel', (event) => {
          // Ctrlキーが押されているかチェック
          if (event.ctrlKey) {
            // デフォルトの動作を防止（ブラウザのズーム）
            event.preventDefault();
            
            // ホイールの方向に応じてスケールを調整
            const delta = event.deltaY > 0 ? -scaleSpeed : scaleSpeed;
            scale = Math.max(minScale, Math.min(maxScale, scale + delta));
            
            // コンテナに変換を適用（トランジションなし）
            container.style.transform = \`scale(\${scale})\`;
          }
        }, { passive: false });
        
        // ダブルクリックでズームをリセット
        container.addEventListener('dblclick', () => {
          scale = 1;
          container.style.transform = 'scale(1)';
        });
      </script>
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
  getSvgContent(): string {
    return this._svgContent;
  }
}
