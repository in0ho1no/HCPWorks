import { TableData } from './parse/file_parse';
import { SvgFigureDefine } from './render/svg_figure_define';
import { SvgFigureText } from './render/svg_figure_text';

/**
 * SVGコンテンツを管理する
 *
 * このクラスはSVG要素の名前、変換元のテキスト、変換後のSVGを管理します。
 */
export class SvgContent {
  /**
   * ラスタライズ後の画像の長辺の上限(ピクセル)
   *
   * Canvasには寸法の上限があり、超えると例外を投げないまま空の画像が出力される。
   * 上限値はブラウザ・GPUに依存するため、広く安全とされる値を採用する。
   */
  public static readonly MAX_EXPORT_PIXELS = 8192;

  /**
   * 表示状態を保持するモジュールの上限件数
   *
   * Webviewの状態はパネルが生きている間ずっと残るため、上限が無いと際限なく増える。
   * 超えた分は最後に見たものから遠い順に捨てる。
   */
  public static readonly MAX_STATE_ENTRIES = 20;

  /**
   * 表示状態の保存を間引く間隔(ミリ秒)
   *
   * スクロールとズームは1操作で何度もイベントが飛ぶため、そのたびに保存すると頻度が高すぎる。
   */
  public static readonly SAVE_DEBOUNCE_MS = 200;

  private _name: string;
  private _sourcePath: string;
  private _textContent: string[];
  private _svgContent: string;
  private _tables: TableData[];

  /**
   * SvgContentクラスの新しいインスタンスを作成する
   */
  constructor() {
    this._name = "";
    this._sourcePath = "";
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
   * 変換元hcpファイルのパスを設定する
   *
   * @param sourcePath - 変換元ファイルのフルパス
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  setSourcePath(sourcePath: string): SvgContent {
    this._sourcePath = sourcePath;
    return this;
  }

  /**
   * 変換元hcpファイルのパスを取得する
   *
   * @returns 変換元ファイルのフルパス。未設定なら空文字
   */
  getSourcePath(): string {
    return this._sourcePath;
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
   * 表示状態を保存する際のキーを組み立てる
   *
   * Webviewの状態はパネル単位で保持されるが、パネルはモジュールを切り替えても使い回される。
   * パネル単位のまま保存すると、別のモジュールへ切り替えたときに
   * 前のモジュールの倍率やスクロール位置がそのまま適用されてしまう。
   *
   * @returns 元ファイルパスとモジュール名から作ったキー
   */
  getStateKey(): string {
    return `${this._sourcePath}\n${this._name}`;
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
            display: flex;
            flex-direction: column;
          }

          /* ツールバーは #svgContainer の外に置くこと。
             エクスポートは #svgContainer 内のSVGを直列化する方式のため、
             外にある限り出力画像へ写り込まない */
          .preview-toolbar {
            flex: none;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 6px;
            border-bottom: 1px solid var(--vscode-panel-border, rgba(128, 128, 128, 0.35));
          }

          .toolbar-button {
            font-family: inherit;
            font-size: 12px;
            line-height: 18px;
            padding: 1px 10px;
            border: none;
            border-radius: 2px;
            cursor: pointer;
            color: var(--vscode-button-secondaryForeground, var(--vscode-foreground, #ccc));
            background-color: var(--vscode-button-secondaryBackground, rgba(128, 128, 128, 0.25));
          }

          .toolbar-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground, rgba(128, 128, 128, 0.4));
          }

          .toolbar-button:focus-visible {
            outline: 1px solid var(--vscode-focusBorder, #0078d4);
            outline-offset: 1px;
          }

          /* 操作の成否を伝える一時表示。クリップボード書き込みは失敗しうるため、
             無反応に見えないよう Webview 内で完結して通知する */
          .preview-toast {
            position: fixed;
            left: 50%;
            bottom: 16px;
            transform: translateX(-50%);
            max-width: 90%;
            padding: 4px 12px;
            font-size: 12px;
            border-radius: 4px;
            pointer-events: none;
            z-index: 10;
            color: var(--vscode-notifications-foreground, var(--vscode-foreground, #ccc));
            background-color: var(--vscode-notifications-background, var(--vscode-editor-background, #252526));
            border: 1px solid var(--vscode-notifications-border, rgba(128, 128, 128, 0.35));
          }

          .preview-toast[hidden] {
            display: none;
          }

          .split-container {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            width: 100%;
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
      <div class="preview-toolbar" id="previewToolbar">
        <button type="button" class="toolbar-button" id="resetViewButton" title="Reset the zoom and scroll position">Reset View</button>
        <button type="button" class="toolbar-button" id="copyImageButton" title="Copy the chart to the clipboard as a PNG image">Copy Image</button>
      </div>
      <div class="preview-toast" id="previewToast" role="status" aria-live="polite" hidden></div>
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

        /**
         * 表示中のチャートをCanvasへラスタライズする
         *
         * 画像保存とクリップボードへのコピーで同じ倍率計算を共有するため、
         * 「Canvasを作るところまで」を切り出してある。
         * 出力形式の違いは呼び出し側が描画済みCanvasから作る。
         *
         * @param onSuccess - 描画済みCanvasを受け取る関数
         * @param onError - 失敗理由(文字列)を受け取る関数
         */
        const rasterize = (onSuccess, onError) => {
          try {
            const svgElement = document.querySelector('#svgContainer svg');
            if (!svgElement) {
              onError('SVG element not found.');
              return;
            }

            // SVGを文字列化してdata URL化する
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

            // SVGのwidth/heightを取得する
            const width = svgElement.width.baseVal.value || svgElement.viewBox.baseVal.width;
            const height = svgElement.height.baseVal.value || svgElement.viewBox.baseVal.height;

            // 粗さを抑えるため2倍解像度でラスタライズする
            // ただしCanvasには寸法の上限があり、超えると例外も出ないまま空の画像になる。
            // 長辺が上限を超える場合は倍率を下げ、等倍でも超えるなら縮小する
            const maxPixels = ${SvgContent.MAX_EXPORT_PIXELS};
            const longerSide = Math.max(width, height);
            const scale = longerSide > 0 ? Math.min(2, maxPixels / longerSide) : 2;

            const image = new Image();
            image.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                // canvas.width は整数へ切り捨てられるため、描画側と食い違わないよう丸めた値を使う
                canvas.width = Math.max(1, Math.round(width * scale));
                canvas.height = Math.max(1, Math.round(height * scale));
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                onSuccess(canvas);
              } catch (err) {
                onError(String(err));
              }
            };
            image.onerror = () => {
              onError('Failed to load SVG image.');
            };
            image.src = svgDataUrl;
          } catch (err) {
            onError(String(err));
          }
        };

        // 拡張機能からの要求を受け付ける
        window.addEventListener('message', (event) => {
          const message = event.data;
          if (!message) {
            return;
          }

          // 表示状態を初期化して全体を見渡せる状態へ戻す
          if (message.command === 'resetView') {
            resetView();
            return;
          }

          if (message.command !== 'exportImage') {
            return;
          }

          const requestId = message.requestId;

          // 形式に応じたMIMEタイプを決定する(未知の形式はPNG扱い)
          const mimeMap = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
          const mime = mimeMap[message.format] || 'image/png';

          rasterize(
            (canvas) => {
              try {
                const dataUrl = canvas.toDataURL(mime);
                vscode.postMessage({ command: 'exportImageResult', requestId, dataUrl });
              } catch (err) {
                vscode.postMessage({ command: 'exportImageResult', requestId, error: String(err) });
              }
            },
            (error) => {
              vscode.postMessage({ command: 'exportImageResult', requestId, error });
            }
          );
        });

        // 初期ズームレベル
        let scale = 1;
        // 最小・最大ズームレベル
        const minScale = 0.1;
        const maxScale = 10;
        // スケーリング速度
        const scaleSpeed = 0.1;

        // テーブルペインの高さの下限(ピクセル)と、ウィンドウ高さに対する上限の割合
        // CSSの min-height / max-height と揃えること
        const minPaneHeight = 60;
        const maxPaneHeightRatio = 0.85;

        // 表示状態の保存キー。パネルは使い回されるためモジュール単位で分ける
        const stateKey = ${JSON.stringify(this.getStateKey())};
        const maxStateEntries = ${SvgContent.MAX_STATE_ENTRIES};
        const saveDebounceMs = ${SvgContent.SAVE_DEBOUNCE_MS};

        const container = document.getElementById('svgContainer');
        const svgPane = document.getElementById('svgPane');
        const tablePane = document.getElementById('tablePane');

        // ドラッグで指定されたテーブルペインの高さ(未指定ならCSSの既定に任せる)
        let tablePaneHeight = null;

        const restoreScrollPosition = (element, position) => {
          if (!element || !position) { return; }
          element.scrollLeft = position.left || 0;
          element.scrollTop = position.top || 0;
        };

        const getScrollPosition = (element) => ({
          left: element ? element.scrollLeft : 0,
          top: element ? element.scrollTop : 0,
        });

        /**
         * 数値として妥当なら範囲へ収めて返す
         *
         * 保存値はウィンドウの大きさが変わった後でも読み出されるため、
         * そのまま適用すると画面を占有したり、操作不能な倍率になったりする。
         *
         * @returns 範囲へ収めた数値。数値として解釈できなければ null
         */
        const clampNumber = (value, min, max) => {
          const number = Number(value);
          if (!Number.isFinite(number)) { return null; }
          return Math.min(max, Math.max(min, number));
        };

        /** 保存済みの表示状態を配列として取り出す(未保存や壊れていれば空配列) */
        const loadStateEntries = () => {
          const stored = vscode.getState();
          return stored && Array.isArray(stored.entries) ? stored.entries : [];
        };

        /** 表示中のモジュールの表示状態を保存する */
        const savePreviewStateNow = () => {
          // 同じキーの記録を除いてから先頭へ入れ直し、上限を超えた古い分を捨てる
          const entries = loadStateEntries().filter((entry) => entry && entry.key !== stateKey);
          entries.unshift({
            key: stateKey,
            scale,
            tablePaneHeight,
            scroll: {
              svgPane: getScrollPosition(svgPane),
              tablePane: getScrollPosition(tablePane),
            },
          });
          vscode.setState({ entries: entries.slice(0, maxStateEntries) });
        };

        // スクロールとズームは1操作で何度もイベントが飛ぶため、保存を間引く
        // 単発の操作(リセット・ドラッグ完了・破棄前)は savePreviewStateNow を直接呼ぶこと
        let saveTimer = 0;
        const savePreviewState = () => {
          clearTimeout(saveTimer);
          saveTimer = setTimeout(savePreviewStateNow, saveDebounceMs);
        };

        const previousState = loadStateEntries().find((entry) => entry && entry.key === stateKey) || {};

        // 倍率は保存時と同じ範囲へ収める。解釈できない値は等倍として扱う
        scale = clampNumber(previousState.scale, minScale, maxScale) ?? 1;
        if (scale !== 1) {
          container.style.transform = \`scale(\${scale})\`;
        }

        // ペイン高さは絶対ピクセルで保存されるため、ウィンドウが当時より小さいと収まらない
        if (tablePane && previousState.tablePaneHeight != null) {
          const paneLimit = Math.max(minPaneHeight, window.innerHeight * maxPaneHeightRatio);
          tablePaneHeight = clampNumber(previousState.tablePaneHeight, minPaneHeight, paneLimit);
          if (tablePaneHeight !== null) {
            tablePane.style.flex = \`0 0 \${tablePaneHeight}px\`;
          }
        }

        requestAnimationFrame(() => {
          restoreScrollPosition(svgPane, previousState.scroll && previousState.scroll.svgPane);
          restoreScrollPosition(tablePane, previousState.scroll && previousState.scroll.tablePane);
        });

        svgPane.addEventListener('scroll', savePreviewState);
        if (tablePane) {
          tablePane.addEventListener('scroll', savePreviewState);
        }
        // 間引き待ちのまま破棄・非表示になると保存が実行されないため、その場で書き出す
        // プレビューの更新やモジュールの切り替えはHTMLごと差し替わるので、ここが最後の機会になる
        window.addEventListener('beforeunload', savePreviewStateNow);
        window.addEventListener('pagehide', savePreviewStateNow);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            savePreviewStateNow();
          }
        });

        // ズーム倍率とスクロール位置を初期状態へ戻す
        // 拡大したまま位置を見失った場合の復帰手段として用いる
        const resetView = () => {
          scale = 1;
          container.style.transform = 'scale(1)';
          restoreScrollPosition(svgPane, { left: 0, top: 0 });
          restoreScrollPosition(tablePane, { left: 0, top: 0 });
          savePreviewStateNow();
        };

        // 操作の結果を一定時間だけ表示する
        const toast = document.getElementById('previewToast');
        let toastTimer = 0;
        const showToast = (text) => {
          toast.textContent = text;
          toast.hidden = false;
          clearTimeout(toastTimer);
          toastTimer = setTimeout(() => { toast.hidden = true; }, 2500);
        };

        /**
         * 表示中のチャートをPNGとしてクリップボードへ書き込む
         *
         * クリップボードへの書き込みは「文書がフォーカスされていること」と
         * 「ユーザー操作起点であること」を要求するため、タイトルバーのコマンドからではなく
         * Webview内のボタンから直接呼ぶ必要がある。
         */
        const copyImageToClipboard = () => {
          if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
            showToast('Clipboard is not available');
            return;
          }

          rasterize(
            (canvas) => {
              canvas.toBlob((blob) => {
                if (!blob) {
                  showToast('Copy failed');
                  return;
                }
                navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                  .then(() => showToast('Copied to clipboard'))
                  .catch(() => showToast('Copy failed'));
              }, 'image/png');
            },
            () => showToast('Copy failed')
          );
        };

        document.getElementById('resetViewButton').addEventListener('click', resetView);
        document.getElementById('copyImageButton').addEventListener('click', copyImageToClipboard);

        // SVGペインのみCtrl+Wheelでズーム（テーブルペインのスクロールと干渉しない）
        svgPane.addEventListener('wheel', (event) => {
          if (event.ctrlKey) {
            event.preventDefault();
            const delta = event.deltaY > 0 ? -scaleSpeed : scaleSpeed;
            scale = Math.max(minScale, Math.min(maxScale, scale + delta));
            container.style.transform = \`scale(\${scale})\`;
            savePreviewState();
          }
        }, { passive: false });

        // ダブルクリックでズームをリセット
        container.addEventListener('dblclick', () => {
          scale = 1;
          container.style.transform = 'scale(1)';
          savePreviewStateNow();
        });

        // スプリッターのドラッグでテーブルペインの幅を変更する
        const splitter = document.getElementById('splitter');
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
            tablePaneHeight = Math.max(minPaneHeight, startHeight + e.clientY - startY);
            tablePane.style.flex = \`0 0 \${tablePaneHeight}px\`;
          });

          document.addEventListener('mouseup', () => {
            if (isResizing) {
              isResizing = false;
              document.body.style.userSelect = '';
              document.body.style.cursor = '';
              // ドラッグの終わりは単発の操作なので間引かずに保存する
              savePreviewStateNow();
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
