import { TableData } from './parse/file_parse';
import { SvgFigureDefine } from './render/svg_figure_define';
import { SvgFigureText } from './render/svg_figure_text';

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
   * セル内の文字列断片を装飾タグを反映したHTMLへ変換する
   *
   * @param part - `<br>`で分割済みのセル文字列
   * @returns 装飾とエスケープを反映したHTML文字列
   */
  private renderDecoratedCellPart(part: string): string {
    if (!SvgFigureText.hasDecorationTag(part)) {
      return this.escapeHtml(part);
    }

    const { segments, error } = SvgFigureText.parseDecorationSegments(part);
    if (error) {
      return `<span class="hcp-deco-error">${this.escapeHtml(part)}</span>`;
    }

    return segments.map((segment) => {
      const escapedText = this.escapeHtml(segment.text);
      if (segment.deco === 'del') {
        return `<del class="hcp-deco-del">${escapedText}</del>`;
      }
      if (segment.deco === 'ins') {
        return `<ins class="hcp-deco-ins">${escapedText}</ins>`;
      }
      return escapedText;
    }).join("");
  }

  /**
   * セルの文字列をHTMLへ変換する
   *
    * `<br>`(`<br/>` `<br />` 等)と装飾タグ(`<del>`/`<ins>`)を反映し、
    * それ以外はエスケープする。
   * セル内の改行はExcelへ「書式あり貼り付け」した際にセル内改行として扱われる。
   *
   * @param cell - セルの文字列
   * @returns 改行を反映したHTML文字列
   */
  private renderCellContent(cell: string): string {
    return cell
      .split(/<br\s*\/?>/i)
      .map(part => this.renderDecoratedCellPart(part))
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
    const hasTables = this._tables.length > 0;
    const hiddenStyle = 'display:none';

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
            overflow: hidden;
            height: 100vh;
          }

          .split-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            width: 100vw;
          }

          .table-pane {
            flex: 0 0 40%;
            min-height: 60px;
            max-height: 85%;
            overflow: auto;
          }

          .splitter {
            flex: none;
            height: 5px;
            cursor: row-resize;
            background-color: var(--vscode-sash-hoverBorder, #888);
            opacity: 0.4;
            transition: opacity 0.15s;
          }

          .splitter:hover {
            opacity: 1;
          }

          .svg-pane {
            flex: 1;
            min-height: 60px;
            overflow: auto;
          }

          .svg-container {
            display: inline-block;
            min-width: min-content;
            transform-origin: 0 0;
          }

          svg {
            display: block;
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

          .hcp-table .hcp-deco-del {
            background-color: ${SvgFigureDefine.STRIKE_BG_COLOR};
            color: #1f1f1f;
            text-decoration: line-through;
            text-decoration-color: #1f1f1f;
          }

          .hcp-table .hcp-deco-ins {
            background-color: ${SvgFigureDefine.INSERT_BG_COLOR};
            color: #1f1f1f;
            text-decoration: none;
          }

          .hcp-table .hcp-deco-error {
            background-color: ${SvgFigureDefine.DECORATION_ERROR_BG_COLOR};
            color: #1f1f1f;
          }
        </style>
      </head>
      <body>
      <div class="split-container">
        <div class="table-pane" id="tablePane" style="${hasTables ? '' : hiddenStyle}">
          <div class="hcp-tables">
            ${this.getTablesHtml()}
          </div>
        </div>
        <div class="splitter" id="splitter" style="${hasTables ? '' : hiddenStyle}"></div>
        <div class="svg-pane" id="svgPane">
          <div class="svg-container" id="svgContainer">
            ${this._svgContent}
          </div>
        </div>
      </div>

      <script>
        // 拡張機能との通信用API
        const vscode = acquireVsCodeApi();

        // 拡張機能からのエクスポート要求を受けて画像へラスタライズする
        window.addEventListener('message', (event) => {
          const message = event.data;
          if (!message || message.command !== 'exportImage') {
            return;
          }

          const requestId = message.requestId;
          try {
            const svgElement = document.querySelector('#svgContainer svg');
            if (!svgElement) {
              vscode.postMessage({ command: 'exportImageResult', requestId, error: 'SVG element not found.' });
              return;
            }

            // SVGを文字列化してdata URL化する
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

            // SVGのwidth/heightを取得する
            const width = svgElement.width.baseVal.value || svgElement.viewBox.baseVal.width;
            const height = svgElement.height.baseVal.value || svgElement.viewBox.baseVal.height;

            // 粗さを抑えるため2倍解像度でラスタライズする
            const scale = 2;

            // 形式に応じたMIMEタイプを決定する(未知の形式はPNG扱い)
            const mimeMap = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
            const mime = mimeMap[message.format] || 'image/png';

            const image = new Image();
            image.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = width * scale;
                canvas.height = height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, width * scale, height * scale);
                const dataUrl = canvas.toDataURL(mime);
                vscode.postMessage({ command: 'exportImageResult', requestId, dataUrl });
              } catch (err) {
                vscode.postMessage({ command: 'exportImageResult', requestId, error: String(err) });
              }
            };
            image.onerror = () => {
              vscode.postMessage({ command: 'exportImageResult', requestId, error: 'Failed to load SVG image.' });
            };
            image.src = svgDataUrl;
          } catch (err) {
            vscode.postMessage({ command: 'exportImageResult', requestId, error: String(err) });
          }
        });

        // 初期ズームレベル
        let scale = 1;
        // 最小・最大ズームレベル
        const minScale = 0.1;
        const maxScale = 10;
        // スケーリング速度
        const scaleSpeed = 0.1;

        const container = document.getElementById('svgContainer');
        const svgPane = document.getElementById('svgPane');

        // SVGペインのみCtrl+Wheelでズーム（テーブルペインのスクロールと干渉しない）
        svgPane.addEventListener('wheel', (event) => {
          if (event.ctrlKey) {
            event.preventDefault();
            const delta = event.deltaY > 0 ? -scaleSpeed : scaleSpeed;
            scale = Math.max(minScale, Math.min(maxScale, scale + delta));
            container.style.transform = \`scale(\${scale})\`;
          }
        }, { passive: false });

        // ダブルクリックでズームをリセット
        container.addEventListener('dblclick', () => {
          scale = 1;
          container.style.transform = 'scale(1)';
        });

        // スプリッターのドラッグでテーブルペインの幅を変更する
        const splitter = document.getElementById('splitter');
        const tablePane = document.getElementById('tablePane');
        if (splitter && tablePane) {
          let isResizing = false;
          let startY = 0;
          let startHeight = 0;

          splitter.addEventListener('mousedown', (e) => {
            isResizing = true;
            startY = e.clientY;
            startHeight = tablePane.getBoundingClientRect().height;
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'row-resize';
          });

          document.addEventListener('mousemove', (e) => {
            if (!isResizing) { return; }
            const newHeight = Math.max(60, startHeight + e.clientY - startY);
            tablePane.style.flex = \`0 0 \${newHeight}px\`;
          });

          document.addEventListener('mouseup', () => {
            if (isResizing) {
              isResizing = false;
              document.body.style.userSelect = '';
              document.body.style.cursor = '';
            }
          });
        }
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
