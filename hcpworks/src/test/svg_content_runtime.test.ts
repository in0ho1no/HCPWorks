import * as assert from 'assert';
import { JSDOM, VirtualConsole, DOMWindow } from 'jsdom';
import { SvgContent } from '../svg_content';
import { TableData } from '../parse/file_parse';

/**
 * Webview の生成HTMLを jsdom 上で実行し、実際の挙動を検証するためのテスト
 *
 * svg_content.test.ts が「生成された文字列に何が含まれるか」を見るのに対し、
 * こちらは「スクリプトを動かした結果どうなるか」を見る。
 */

/** 検証用の表データ */
const SAMPLE_TABLE: TableData = {
  caption: 'サンプル表',
  rows: [{ cells: ['項目', '説明'], depth: 0 }],
};

/** Webview へ渡す SVG。寸法はテスト側で上書きするため見た目は問わない */
const SAMPLE_SVG = '<svg width="100" height="50"><rect width="10" height="10"/></svg>';

interface WebviewHarness {
  window: DOMWindow;

  /** 拡張機能へ送られたメッセージ */
  posted: Record<string, unknown>[];

  /** vscode.setState に保存された値 */
  savedState(): unknown;

  /** 拡張機能からのメッセージを Webview へ届ける */
  send(message: Record<string, unknown>): void;

  /** 次のフレームまで待つ(復元処理が requestAnimationFrame を使うため) */
  nextFrame(): Promise<void>;

  /** マイクロタスク/タイマーの完了を待つ */
  settle(): Promise<void>;

  element(id: string): HTMLElement;

  /** #svgContainer 内のSVG要素 */
  svgElement(): Element;

  close(): void;
}

/**
 * プレビューの Webview を jsdom 上に構築する
 *
 * @param options.tables - 表データ(省略時は表なし)
 * @param options.previousState - 読み込み時に getState が返す値
 */
function createWebview(options: { tables?: TableData[]; previousState?: unknown } = {}): WebviewHarness {
  const content = new SvgContent().setName('module').setSvgContent(SAMPLE_SVG);
  if (options.tables) {
    content.setTables(options.tables);
  }
  const html = content.getHtmlWrappedSvg();

  const posted: Record<string, unknown>[] = [];
  let state: unknown = options.previousState;

  // 未実装APIの警告は捨て、スクリプトの実行時エラーだけ拾う
  const virtualConsole = new VirtualConsole();
  const scriptErrors: string[] = [];
  virtualConsole.on('jsdomError', (error: Error) => scriptErrors.push(error.message));

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      (window as unknown as Record<string, unknown>).acquireVsCodeApi = () => ({
        postMessage: (message: Record<string, unknown>) => posted.push(message),
        setState: (value: unknown) => { state = value; },
        getState: () => state,
      });
    },
  });

  assert.deepStrictEqual(scriptErrors, [], 'webview script should run without errors');

  const window = dom.window;
  return {
    window,
    posted,
    savedState: () => state,
    send: (message) => {
      window.dispatchEvent(new window.MessageEvent('message', { data: message }));
    },
    nextFrame: () => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve())),
    settle: () => new Promise<void>((resolve) => window.setTimeout(resolve, 0)),
    element: (id) => {
      const found = window.document.getElementById(id);
      assert.ok(found, `#${id} should exist`);
      return found as HTMLElement;
    },
    svgElement: () => {
      const found = window.document.querySelector('#svgContainer svg');
      assert.ok(found, 'svg element should exist');
      return found as Element;
    },
    close: () => window.close(),
  };
}

/**
 * jsdom 側で生成された値を Node 側のプレーンな値へ変換する
 *
 * jsdom は別の realm で動くため、オブジェクトのプロトタイプが Node 側と異なる。
 * そのまま deepStrictEqual へ渡すと、構造が同じでも不一致になる。
 */
function plain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** transform に設定された拡大率を取り出す */
function currentScale(container: HTMLElement): number {
  const matched = container.style.transform.match(/scale\(([\d.]+)\)/);
  assert.ok(matched, `transform should hold a scale: ${container.style.transform}`);
  return Number(matched[1]);
}

/** Ctrl+ホイールを指定回数発生させる */
function zoom(harness: WebviewHarness, times: number, direction: 'in' | 'out'): void {
  const svgPane = harness.element('svgPane');
  for (let i = 0; i < times; i++) {
    svgPane.dispatchEvent(new harness.window.WheelEvent('wheel', {
      deltaY: direction === 'in' ? -1 : 1,
      ctrlKey: true,
    }));
  }
}

/**
 * ラスタライズに必要なブラウザAPIを差し替える
 *
 * jsdom は SVG の寸法プロパティも Canvas も実装していないため、
 * エクスポート処理を動かすには最低限のスタブが要る。
 *
 * @returns 生成されたCanvasの記録
 */
function stubRasterization(
  harness: WebviewHarness,
  size: { width: number; height: number }
): { width: number; height: number; mime?: string }[] {
  const svg = harness.svgElement();
  Object.defineProperty(svg, 'width', { value: { baseVal: { value: size.width } }, configurable: true });
  Object.defineProperty(svg, 'height', { value: { baseVal: { value: size.height } }, configurable: true });
  Object.defineProperty(svg, 'viewBox', {
    value: { baseVal: { width: size.width, height: size.height } },
    configurable: true,
  });

  const canvases: { width: number; height: number; mime?: string }[] = [];
  const document = harness.window.document;
  const createElement = document.createElement.bind(document);
  document.createElement = ((tagName: string) => {
    if (tagName !== 'canvas') {
      return createElement(tagName);
    }
    const canvas = {
      width: 0,
      height: 0,
      mime: undefined as string | undefined,
      getContext: () => ({ drawImage: () => undefined }),
      toDataURL: (mime: string) => {
        canvas.mime = mime;
        return `data:${mime};base64,AAAA`;
      },
    };
    canvases.push(canvas);
    return canvas;
  }) as typeof document.createElement;

  // src を設定した時点で読み込み成功として扱う
  (harness.window as unknown as Record<string, unknown>).Image = class {
    public onload: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public set src(_value: string) {
      harness.window.setTimeout(() => this.onload?.(), 0);
    }
  };

  return canvases;
}

suite('SvgContent - Webview runtime - scroll state', () => {
  let harness: WebviewHarness;

  teardown(() => harness?.close());

  test('should save the scroll position of both panes', () => {
    harness = createWebview({ tables: [SAMPLE_TABLE] });

    const svgPane = harness.element('svgPane');
    svgPane.scrollTop = 120;
    svgPane.scrollLeft = 34;
    svgPane.dispatchEvent(new harness.window.Event('scroll'));

    assert.deepStrictEqual(plain(harness.savedState()), {
      scroll: {
        svgPane: { left: 34, top: 120 },
        tablePane: { left: 0, top: 0 },
      },
    });
  });

  test('should restore the saved scroll position on load', async () => {
    harness = createWebview({
      tables: [SAMPLE_TABLE],
      previousState: { scroll: { svgPane: { left: 12, top: 340 }, tablePane: { left: 0, top: 56 } } },
    });

    await harness.nextFrame();

    assert.strictEqual(harness.element('svgPane').scrollTop, 340);
    assert.strictEqual(harness.element('svgPane').scrollLeft, 12);
    assert.strictEqual(harness.element('tablePane').scrollTop, 56);
  });

  test('should save the scroll position before the webview is torn down', () => {
    harness = createWebview();

    harness.element('svgPane').scrollTop = 80;
    harness.window.dispatchEvent(new harness.window.Event('beforeunload'));

    const state = harness.savedState() as { scroll: { svgPane: { top: number } } };
    assert.strictEqual(state.scroll.svgPane.top, 80);
  });
});

suite('SvgContent - Webview runtime - zoom', () => {
  let harness: WebviewHarness;

  setup(() => {
    harness = createWebview();
  });

  teardown(() => harness.close());

  test('should zoom in and out with ctrl + wheel', () => {
    const container = harness.element('svgContainer');

    zoom(harness, 1, 'in');
    const enlarged = currentScale(container);
    assert.ok(enlarged > 1, `scale should grow: ${enlarged}`);

    zoom(harness, 2, 'out');
    assert.ok(currentScale(container) < enlarged, 'scale should shrink again');
  });

  test('should ignore wheel events without the ctrl key', () => {
    const svgPane = harness.element('svgPane');

    svgPane.dispatchEvent(new harness.window.WheelEvent('wheel', { deltaY: -1 }));

    assert.strictEqual(harness.element('svgContainer').style.transform, '');
  });

  test('should keep the zoom within the allowed range', () => {
    const container = harness.element('svgContainer');

    zoom(harness, 200, 'in');
    assert.ok(currentScale(container) <= 10, 'scale should not exceed the maximum');

    zoom(harness, 400, 'out');
    assert.ok(currentScale(container) >= 0.1, 'scale should not drop below the minimum');
  });

  test('should reset only the zoom on double click, keeping the scroll position', () => {
    const svgPane = harness.element('svgPane');
    svgPane.scrollTop = 200;
    zoom(harness, 3, 'in');

    harness.element('svgContainer').dispatchEvent(
      new harness.window.MouseEvent('dblclick', { bubbles: true })
    );

    assert.strictEqual(currentScale(harness.element('svgContainer')), 1);
    assert.strictEqual(svgPane.scrollTop, 200, 'double click should not move the scroll position');
  });
});

suite('SvgContent - Webview runtime - resetView', () => {
  let harness: WebviewHarness;

  teardown(() => harness.close());

  test('should reset both the zoom and the scroll position', () => {
    harness = createWebview({ tables: [SAMPLE_TABLE] });
    const svgPane = harness.element('svgPane');
    svgPane.scrollTop = 300;
    svgPane.scrollLeft = 40;
    harness.element('tablePane').scrollTop = 25;
    zoom(harness, 5, 'in');

    harness.send({ command: 'resetView' });

    assert.strictEqual(currentScale(harness.element('svgContainer')), 1);
    assert.strictEqual(svgPane.scrollTop, 0);
    assert.strictEqual(svgPane.scrollLeft, 0);
    assert.strictEqual(harness.element('tablePane').scrollTop, 0);
  });

  test('should persist the reset position so it survives the next refresh', () => {
    harness = createWebview();
    harness.element('svgPane').scrollTop = 300;

    harness.send({ command: 'resetView' });

    assert.deepStrictEqual(plain(harness.savedState()), {
      scroll: {
        svgPane: { left: 0, top: 0 },
        tablePane: { left: 0, top: 0 },
      },
    });
  });

  test('should ignore unknown commands', () => {
    harness = createWebview();
    harness.element('svgPane').scrollTop = 300;

    harness.send({ command: 'somethingElse' });

    assert.strictEqual(harness.element('svgPane').scrollTop, 300);
  });
});

suite('SvgContent - Webview runtime - splitter', () => {
  let harness: WebviewHarness;

  setup(() => {
    harness = createWebview({ tables: [SAMPLE_TABLE] });
  });

  teardown(() => harness.close());

  /** スプリッタをY方向に移動させる */
  function drag(deltaY: number): void {
    const splitter = harness.element('splitter');
    const window = harness.window;
    splitter.dispatchEvent(new window.MouseEvent('mousedown', { clientY: 0, bubbles: true }));
    window.document.dispatchEvent(new window.MouseEvent('mousemove', { clientY: deltaY, bubbles: true }));
    window.document.dispatchEvent(new window.MouseEvent('mouseup', { bubbles: true }));
  }

  test('should resize the table pane while dragging', () => {
    drag(200);

    assert.strictEqual(harness.element('tablePane').style.flex, '0 0 200px');
  });

  test('should keep a minimum height for the table pane', () => {
    drag(-500);

    assert.strictEqual(harness.element('tablePane').style.flex, '0 0 60px');
  });

  test('should stop resizing after the button is released', () => {
    drag(200);
    const window = harness.window;
    window.document.dispatchEvent(new window.MouseEvent('mousemove', { clientY: 400, bubbles: true }));

    assert.strictEqual(harness.element('tablePane').style.flex, '0 0 200px');
  });
});

suite('SvgContent - Webview runtime - exportImage', () => {
  let harness: WebviewHarness;

  teardown(() => harness.close());

  test('should rasterize at 2x for a chart within the size limit', async () => {
    harness = createWebview();
    const canvases = stubRasterization(harness, { width: 800, height: 600 });

    harness.send({ command: 'exportImage', format: 'png', requestId: 'r1' });
    await harness.settle();

    assert.strictEqual(canvases.length, 1);
    assert.strictEqual(canvases[0].width, 1600);
    assert.strictEqual(canvases[0].height, 1200);
    assert.deepStrictEqual(plain(harness.posted), [
      { command: 'exportImageResult', requestId: 'r1', dataUrl: 'data:image/png;base64,AAAA' },
    ]);
  });

  test('should clamp the longer side to MAX_EXPORT_PIXELS', async () => {
    harness = createWebview();
    const canvases = stubRasterization(harness, { width: 6000, height: 1000 });

    harness.send({ command: 'exportImage', format: 'png', requestId: 'r1' });
    await harness.settle();

    assert.strictEqual(canvases[0].width, SvgContent.MAX_EXPORT_PIXELS);
    assert.ok(canvases[0].height <= SvgContent.MAX_EXPORT_PIXELS);
    // 縦横比が保たれること(6000:1000 = 6:1)
    assert.strictEqual(canvases[0].height, Math.round(SvgContent.MAX_EXPORT_PIXELS / 6));
  });

  test('should scale down a chart that exceeds the limit at 1x', async () => {
    harness = createWebview();
    const canvases = stubRasterization(harness, { width: 500, height: 20000 });

    harness.send({ command: 'exportImage', format: 'png', requestId: 'r1' });
    await harness.settle();

    assert.strictEqual(canvases[0].height, SvgContent.MAX_EXPORT_PIXELS);
    assert.ok(canvases[0].width < 500, 'the shorter side should shrink as well');
  });

  test('should honor the requested image format', async () => {
    harness = createWebview();
    const canvases = stubRasterization(harness, { width: 100, height: 100 });

    harness.send({ command: 'exportImage', format: 'webp', requestId: 'r1' });
    await harness.settle();

    assert.strictEqual(canvases[0].mime, 'image/webp');
  });

  test('should report an error when the chart is missing', async () => {
    harness = createWebview();
    harness.svgElement().remove();

    harness.send({ command: 'exportImage', format: 'png', requestId: 'r1' });
    await harness.settle();

    assert.deepStrictEqual(plain(harness.posted), [
      { command: 'exportImageResult', requestId: 'r1', error: 'SVG element not found.' },
    ]);
  });
});
