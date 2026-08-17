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

/** 検証用のプレビュー対象 */
const SAMPLE_SOURCE = '/work/sample.hcp';
const SAMPLE_MODULE = 'module';

/** jsdom の既定のウィンドウ高さ(ペイン高さのクランプ計算に使う) */
const WINDOW_HEIGHT = 768;

/**
 * 表示状態の保存キーを組み立てる
 *
 * 本体と同じ組み立てを使うことで、キーの書式を変えてもテストが追従する。
 */
function stateKeyOf(name = SAMPLE_MODULE, sourcePath = SAMPLE_SOURCE): string {
  return new SvgContent().setName(name).setSourcePath(sourcePath).getStateKey();
}

/** 保存済み状態を1件だけ持つ値を組み立てる */
function stateWith(entry: Record<string, unknown>, key = stateKeyOf()): unknown {
  return { entries: [{ key, ...entry }] };
}

interface WebviewHarness {
  window: DOMWindow;

  /** 拡張機能へ送られたメッセージ */
  posted: Record<string, unknown>[];

  /** vscode.setState に保存された値 */
  savedState(): unknown;

  /** 表示中のモジュールについて保存された表示状態 */
  savedEntry(): Record<string, unknown> | undefined;

  /** vscode.setState が呼ばれた回数(保存の間引きを見るために数える) */
  saveCount(): number;

  /** 間引かれた保存が実行されるまで待つ */
  waitForSave(): Promise<void>;

  /** 拡張機能からのメッセージを Webview へ届ける */
  send(message: Record<string, unknown>): void;

  /** 次のフレームまで待つ(復元処理が requestAnimationFrame を使うため) */
  nextFrame(): Promise<void>;

  /** マイクロタスク/タイマーの完了を待つ */
  settle(): Promise<void>;

  element(id: string): HTMLElement;

  /** #svgContainer 内のSVG要素 */
  svgElement(): Element;

  /**
   * ここまでにスクリプトが例外を投げていないことを確認する
   *
   * イベントハンドラ内の例外は握り潰されて表示上の変化が出ないことがあるため、
   * 操作の直後に呼べるようにしておく。teardown からも必ず呼ばれる。
   */
  assertNoErrors(): void;

  /** 例外の有無を確認したうえで後始末する */
  dispose(): void;
}

/**
 * プレビューの Webview を jsdom 上に構築する
 *
 * @param options.tables - 表データ(省略時は表なし)
 * @param options.previousState - 読み込み時に getState が返す値
 */
function createWebview(
  options: { tables?: TableData[]; previousState?: unknown; name?: string } = {}
): WebviewHarness {
  const content = new SvgContent()
    .setName(options.name ?? SAMPLE_MODULE)
    .setSourcePath(SAMPLE_SOURCE)
    .setSvgContent(SAMPLE_SVG);
  if (options.tables) {
    content.setTables(options.tables);
  }
  const html = content.getHtmlWrappedSvg();
  const stateKey = content.getStateKey();

  const posted: Record<string, unknown>[] = [];
  let state: unknown = options.previousState;
  let saveCount = 0;

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
        setState: (value: unknown) => { state = value; saveCount++; },
        getState: () => state,
      });
    },
  });

  const assertNoErrors = (): void => {
    assert.deepStrictEqual(scriptErrors, [], 'webview script should run without errors');
  };
  assertNoErrors();

  const window = dom.window;
  return {
    window,
    posted,
    savedState: () => state,
    savedEntry: () => {
      const entries = (state as { entries?: Record<string, unknown>[] } | undefined)?.entries;
      return entries?.find((entry) => entry.key === stateKey);
    },
    saveCount: () => saveCount,
    waitForSave: () => new Promise<void>((resolve) => {
      window.setTimeout(resolve, SvgContent.SAVE_DEBOUNCE_MS + 20);
    }),
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
    assertNoErrors,
    dispose: () => {
      // 例外を検出した場合でも requestAnimationFrame のループは止める
      try {
        assertNoErrors();
      } finally {
        window.close();
      }
    },
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

/** スタブしたCanvasの記録 */
interface RecordedCanvas {
  width: number;
  height: number;
  mime?: string;

  /** drawImage に渡された描画寸法 */
  drawn?: { width: number; height: number };

  getContext(): { drawImage(image: unknown, x: number, y: number, width: number, height: number): void };
  toDataURL(mime: string): string;
  toBlob(callback: (blob: unknown) => void, mime: string): void;
}

/** クリップボードへ書き込まれた内容の記録 */
interface RecordedClipboard {
  /** navigator.clipboard.write に渡された ClipboardItem の中身 */
  written: { mime: string; blobType: string }[];
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
): RecordedCanvas[] {
  const svg = harness.svgElement();
  Object.defineProperty(svg, 'width', { value: { baseVal: { value: size.width } }, configurable: true });
  Object.defineProperty(svg, 'height', { value: { baseVal: { value: size.height } }, configurable: true });
  Object.defineProperty(svg, 'viewBox', {
    value: { baseVal: { width: size.width, height: size.height } },
    configurable: true,
  });

  const canvases: RecordedCanvas[] = [];
  const document = harness.window.document;
  const createElement = document.createElement.bind(document);
  document.createElement = ((tagName: string) => {
    if (tagName !== 'canvas') {
      return createElement(tagName);
    }
    const canvas: RecordedCanvas = {
      width: 0,
      height: 0,
      mime: undefined,
      drawn: undefined,
      getContext: () => ({
        // 描画に使われた寸法を記録する(Canvas寸法と食い違っていないかの検証用)
        drawImage: (_image: unknown, _x: number, _y: number, width: number, height: number) => {
          canvas.drawn = { width, height };
        },
      }),
      toDataURL: (mime: string) => {
        canvas.mime = mime;
        return `data:${mime};base64,AAAA`;
      },
      toBlob: (callback: (blob: unknown) => void, mime: string) => {
        canvas.mime = mime;
        callback(new harness.window.Blob(['AAAA'], { type: mime }));
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

/**
 * クリップボードAPIを差し替える
 *
 * jsdom は `navigator.clipboard` も `ClipboardItem` も実装していない。
 * 実際に画像が載ったかは検証できないため、
 * 「正しいMIMEタイプのBlobを渡して呼んだか」までを記録する。
 *
 * @param options.fail - true なら書き込みを失敗させる
 * @returns 書き込まれた内容の記録
 */
function stubClipboard(harness: WebviewHarness, options: { fail?: boolean } = {}): RecordedClipboard {
  const recorded: RecordedClipboard = { written: [] };
  const global = harness.window as unknown as Record<string, unknown>;

  // 「MIMEタイプ → Blob」の対応を保持するだけの最小実装
  global.ClipboardItem = class {
    public readonly items: Record<string, { type: string }>;
    constructor(items: Record<string, { type: string }>) {
      this.items = items;
    }
  };

  Object.defineProperty(harness.window.navigator, 'clipboard', {
    configurable: true,
    value: {
      write: (items: { items: Record<string, { type: string }> }[]) => {
        for (const item of items) {
          for (const [mime, blob] of Object.entries(item.items)) {
            recorded.written.push({ mime, blobType: blob.type });
          }
        }
        return options.fail ? Promise.reject(new Error('denied')) : Promise.resolve();
      },
    },
  });

  return recorded;
}

suite('SvgContent - Webview runtime - scroll state', () => {
  let harness: WebviewHarness;

  teardown(() => harness?.dispose());

  test('should save the scroll position of both panes', async () => {
    harness = createWebview({ tables: [SAMPLE_TABLE] });

    const svgPane = harness.element('svgPane');
    svgPane.scrollTop = 120;
    svgPane.scrollLeft = 34;
    svgPane.dispatchEvent(new harness.window.Event('scroll'));
    await harness.waitForSave();

    assert.deepStrictEqual(plain(harness.savedEntry()), {
      key: stateKeyOf(),
      scale: 1,
      tablePaneHeight: null,
      scroll: {
        svgPane: { left: 34, top: 120 },
        tablePane: { left: 0, top: 0 },
      },
    });
  });

  test('should restore the saved scroll position on load', async () => {
    harness = createWebview({
      tables: [SAMPLE_TABLE],
      previousState: stateWith({
        scroll: { svgPane: { left: 12, top: 340 }, tablePane: { left: 0, top: 56 } },
      }),
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

    // 破棄時は間引きの完了を待てないため、その場で保存されている必要がある
    const entry = harness.savedEntry() as { scroll: { svgPane: { top: number } } };
    assert.strictEqual(entry.scroll.svgPane.top, 80);
  });

  test('should flush a pending save when the webview is hidden', () => {
    harness = createWebview();

    harness.element('svgPane').scrollTop = 42;
    harness.element('svgPane').dispatchEvent(new harness.window.Event('scroll'));
    harness.window.dispatchEvent(new harness.window.Event('pagehide'));

    const entry = harness.savedEntry() as { scroll: { svgPane: { top: number } } };
    assert.strictEqual(entry.scroll.svgPane.top, 42);
  });

  test('should flush a pending save when the webview loses focus', () => {
    harness = createWebview();

    harness.element('svgPane').scrollTop = 64;
    harness.element('svgPane').dispatchEvent(new harness.window.Event('scroll'));
    // モジュールを切り替えるにはプレビュー外をクリックする必要があるため、
    // フォーカスが外れた時点で確定していないと、差し替え後のページに追い越される
    harness.window.dispatchEvent(new harness.window.Event('blur'));

    const entry = harness.savedEntry() as { scroll: { svgPane: { top: number } } };
    assert.strictEqual(entry.scroll.svgPane.top, 64);
  });

  test('should flush a pending save when the pointer leaves the preview', () => {
    harness = createWebview();

    // パネルは preserveFocus: true で開くため、ホイール操作だけではフォーカスが移らず
    // blur が発火しない。マウスでモジュールを切り替える経路はこちらで拾う
    zoom(harness, 3, 'in');
    harness.window.document.documentElement.dispatchEvent(new harness.window.Event('pointerleave'));

    const entry = harness.savedEntry() as { scale: number };
    assert.ok(entry.scale > 1, `the zoom should be saved without focus: ${entry.scale}`);
  });

  test('should not save the same state twice after a flush', async () => {
    harness = createWebview();

    harness.element('svgPane').scrollTop = 64;
    harness.element('svgPane').dispatchEvent(new harness.window.Event('scroll'));
    harness.window.dispatchEvent(new harness.window.Event('blur'));
    await harness.waitForSave();

    assert.strictEqual(harness.saveCount(), 1, 'the pending save should be cancelled by the flush');
  });

  test('should save at most once for a burst of scroll events', async () => {
    harness = createWebview();
    const svgPane = harness.element('svgPane');

    for (let i = 1; i <= 5; i++) {
      svgPane.scrollTop = i * 10;
      svgPane.dispatchEvent(new harness.window.Event('scroll'));
    }

    assert.strictEqual(harness.saveCount(), 0, 'should not save while the events keep coming');

    await harness.waitForSave();

    assert.strictEqual(harness.saveCount(), 1);
    const entry = harness.savedEntry() as { scroll: { svgPane: { top: number } } };
    assert.strictEqual(entry.scroll.svgPane.top, 50, 'the last position should win');
  });
});

suite('SvgContent - Webview runtime - preview state', () => {
  let harness: WebviewHarness;

  teardown(() => harness.dispose());

  /** テーブルペインの高さ指定を取り出す */
  function paneFlex(): string {
    return harness.element('tablePane').style.flex;
  }

  test('should ignore the state saved for another module', async () => {
    harness = createWebview({
      tables: [SAMPLE_TABLE],
      previousState: stateWith(
        { scale: 4, tablePaneHeight: 300, scroll: { svgPane: { left: 0, top: 250 } } },
        stateKeyOf('otherModule')
      ),
    });

    await harness.nextFrame();

    assert.strictEqual(harness.element('svgContainer').style.transform, '');
    assert.strictEqual(paneFlex(), '', 'the pane height of another module should not apply');
    assert.strictEqual(harness.element('svgPane').scrollTop, 0);
  });

  test('should restore the zoom of the matching module', () => {
    harness = createWebview({ previousState: stateWith({ scale: 2.5 }) });

    assert.strictEqual(currentScale(harness.element('svgContainer')), 2.5);
  });

  test('should clamp a restored zoom to the allowed range', () => {
    harness = createWebview({ previousState: stateWith({ scale: 50 }) });

    assert.strictEqual(currentScale(harness.element('svgContainer')), 10);
  });

  test('should fall back to 1x for a broken zoom value', () => {
    harness = createWebview({ previousState: stateWith({ scale: 'huge' }) });

    assert.strictEqual(harness.element('svgContainer').style.transform, '');
  });

  test('should restore the table pane height', () => {
    harness = createWebview({ tables: [SAMPLE_TABLE], previousState: stateWith({ tablePaneHeight: 300 }) });

    assert.strictEqual(paneFlex(), '0 0 300px');
  });

  test('should clamp a restored pane height to the current window', () => {
    // 保存時より小さいウィンドウで開いた場合、そのまま適用すると画面を占有する
    harness = createWebview({ tables: [SAMPLE_TABLE], previousState: stateWith({ tablePaneHeight: 5000 }) });

    assert.strictEqual(paneFlex(), `0 0 ${WINDOW_HEIGHT * 0.85}px`);
  });

  test('should keep the minimum height for a restored pane height', () => {
    harness = createWebview({ tables: [SAMPLE_TABLE], previousState: stateWith({ tablePaneHeight: -100 }) });

    assert.strictEqual(paneFlex(), '0 0 60px');
  });

  test('should save the zoom and the pane height together', async () => {
    harness = createWebview({ tables: [SAMPLE_TABLE] });
    const window = harness.window;
    harness.element('tablePane').getBoundingClientRect = () => ({ height: 200 } as DOMRect);

    zoom(harness, 2, 'in');
    harness.element('splitter').dispatchEvent(new window.MouseEvent('mousedown', { clientY: 100, bubbles: true }));
    window.document.dispatchEvent(new window.MouseEvent('mousemove', { clientY: 150, bubbles: true }));
    window.document.dispatchEvent(new window.MouseEvent('mouseup', { bubbles: true }));
    await harness.waitForSave();

    const entry = harness.savedEntry() as { scale: number; tablePaneHeight: number };
    assert.strictEqual(entry.tablePaneHeight, 250);
    assert.ok(entry.scale > 1, `the zoom should be saved as well: ${entry.scale}`);
  });

  test('should keep the newest entries up to the limit', async () => {
    // 上限ちょうどまで別モジュールの記録で埋めておく
    const entries = Array.from({ length: SvgContent.MAX_STATE_ENTRIES }, (_, index) => ({
      key: stateKeyOf(`module${index}`),
      scale: 1,
    }));
    harness = createWebview({ previousState: { entries } });

    harness.element('svgPane').scrollTop = 10;
    harness.window.dispatchEvent(new harness.window.Event('beforeunload'));

    const saved = harness.savedState() as { entries: { key: string }[] };
    assert.strictEqual(saved.entries.length, SvgContent.MAX_STATE_ENTRIES);
    assert.strictEqual(saved.entries[0].key, stateKeyOf(), 'the current module comes first');
    assert.ok(
      !saved.entries.some((entry) => entry.key === stateKeyOf(`module${SvgContent.MAX_STATE_ENTRIES - 1}`)),
      'the oldest entry should be dropped'
    );
  });

  test('should replace the entry of the same module instead of adding one', () => {
    harness = createWebview({ previousState: stateWith({ scale: 2 }) });

    harness.element('svgPane').scrollTop = 10;
    harness.window.dispatchEvent(new harness.window.Event('beforeunload'));

    const saved = harness.savedState() as { entries: unknown[] };
    assert.strictEqual(saved.entries.length, 1);
  });

  test('should not let a module name break out of the script tag', async () => {
    // .hcp の内容は利用者が書くとは限らないため、モジュール名は信用できない入力として扱う
    const attack = '</script><script>window.injected = true;</script>';
    harness = createWebview({ name: attack });

    await harness.nextFrame();

    assert.strictEqual(
      (harness.window as unknown as Record<string, unknown>).injected,
      undefined,
      'the injected script must not run'
    );
    // キーとしては元の文字列がそのまま使えること
    harness.element('svgPane').scrollTop = 10;
    harness.window.dispatchEvent(new harness.window.Event('beforeunload'));
    const saved = harness.savedState() as { entries: { key: string }[] };
    assert.strictEqual(saved.entries[0].key, stateKeyOf(attack));
  });

  test('should start from scratch when the saved state is broken', async () => {
    harness = createWebview({ previousState: { entries: 'not an array' } });

    await harness.nextFrame();

    assert.strictEqual(harness.element('svgContainer').style.transform, '');
    harness.assertNoErrors();
  });
});

suite('SvgContent - Webview runtime - zoom', () => {
  let harness: WebviewHarness;

  setup(() => {
    harness = createWebview();
  });

  teardown(() => harness.dispose());

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

  teardown(() => harness.dispose());

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
    harness = createWebview({ previousState: stateWith({ scale: 3 }) });
    harness.element('svgPane').scrollTop = 300;

    // 単発の操作なので、間引きを待たずにその場で保存される
    harness.send({ command: 'resetView' });

    assert.deepStrictEqual(plain(harness.savedEntry()), {
      key: stateKeyOf(),
      scale: 1,
      tablePaneHeight: null,
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

suite('SvgContent - Webview runtime - toolbar', () => {
  let harness: WebviewHarness;

  teardown(() => harness.dispose());

  /** ツールバーのボタンを押す */
  function click(id: string): void {
    harness.element(id).dispatchEvent(new harness.window.MouseEvent('click', { bubbles: true }));
  }

  /**
   * コピーボタンを押し、処理が終わるまで待つ
   *
   * ラスタライズの完了(Image の onload)とクリップボード書き込みのPromiseを跨ぐため、
   * タイマーの解決を2回待つ必要がある。
   */
  async function clickCopy(): Promise<void> {
    click('copyImageButton');
    await harness.settle();
    await harness.settle();
  }

  /** トーストに表示されている文字列(非表示なら空文字) */
  function toastText(): string {
    const toast = harness.element('previewToast');
    return toast.hidden ? '' : (toast.textContent ?? '');
  }

  test('should place the toolbar outside of the exported container', () => {
    harness = createWebview();

    // エクスポートは #svgContainer 内のSVGを直列化するため、
    // ツールバーが内側にあると出力画像へ写り込む
    assert.ok(!harness.element('svgContainer').contains(harness.element('previewToolbar')));
    assert.ok(!harness.element('svgContainer').contains(harness.element('previewToast')));
  });

  test('should reset both the zoom and the scroll position from the toolbar', () => {
    harness = createWebview({ tables: [SAMPLE_TABLE] });
    const svgPane = harness.element('svgPane');
    svgPane.scrollTop = 300;
    svgPane.scrollLeft = 40;
    harness.element('tablePane').scrollTop = 25;
    zoom(harness, 5, 'in');

    click('resetViewButton');

    assert.strictEqual(currentScale(harness.element('svgContainer')), 1);
    assert.strictEqual(svgPane.scrollTop, 0);
    assert.strictEqual(svgPane.scrollLeft, 0);
    assert.strictEqual(harness.element('tablePane').scrollTop, 0);
  });

  test('should write the chart to the clipboard as a png', async () => {
    harness = createWebview();
    stubRasterization(harness, { width: 800, height: 600 });
    const clipboard = stubClipboard(harness);

    await clickCopy();

    assert.deepStrictEqual(clipboard.written, [{ mime: 'image/png', blobType: 'image/png' }]);
    assert.strictEqual(toastText(), 'Copied to clipboard');
    // コピーは拡張機能を経由せずWebview内で完結する
    assert.deepStrictEqual(harness.posted, []);
  });

  test('should share the size limit with the image export', async () => {
    harness = createWebview();
    const canvases = stubRasterization(harness, { width: 500, height: 20000 });
    stubClipboard(harness);

    await clickCopy();

    assert.strictEqual(canvases[0].height, SvgContent.MAX_EXPORT_PIXELS);
    assert.ok(canvases[0].width < 500, 'the shorter side should shrink as well');
  });

  test('should report a failed clipboard write', async () => {
    harness = createWebview();
    stubRasterization(harness, { width: 800, height: 600 });
    stubClipboard(harness, { fail: true });

    await clickCopy();

    assert.strictEqual(toastText(), 'Copy failed');
  });

  test('should report a failed rasterization', async () => {
    harness = createWebview();
    stubRasterization(harness, { width: 800, height: 600 });
    stubClipboard(harness);
    harness.svgElement().remove();

    await clickCopy();

    assert.strictEqual(toastText(), 'Copy failed');
  });

  test('should report when the clipboard api is unavailable', async () => {
    harness = createWebview();
    stubRasterization(harness, { width: 800, height: 600 });

    await clickCopy();

    assert.strictEqual(toastText(), 'Clipboard is not available');
  });
});

suite('SvgContent - Webview runtime - splitter', () => {
  let harness: WebviewHarness;

  setup(() => {
    harness = createWebview({ tables: [SAMPLE_TABLE] });
  });

  teardown(() => harness.dispose());

  /**
   * テーブルペインの現在の高さを固定する
   *
   * jsdom はレイアウトを持たず getBoundingClientRect() が常に0を返すため、
   * 「現在の高さ + 移動量」で計算していることを検証するには寸法の注入が要る。
   */
  function stubPaneHeight(height: number): void {
    const tablePane = harness.element('tablePane');
    tablePane.getBoundingClientRect = () => ({ height } as DOMRect);
  }

  /** スプリッタを掴んで移動させる */
  function drag(from: number, to: number): void {
    const splitter = harness.element('splitter');
    const window = harness.window;
    splitter.dispatchEvent(new window.MouseEvent('mousedown', { clientY: from, bubbles: true }));
    window.document.dispatchEvent(new window.MouseEvent('mousemove', { clientY: to, bubbles: true }));
    window.document.dispatchEvent(new window.MouseEvent('mouseup', { bubbles: true }));
  }

  test('should add the drag distance to the current height', () => {
    stubPaneHeight(300);

    drag(100, 150);

    assert.strictEqual(harness.element('tablePane').style.flex, '0 0 350px');
  });

  test('should shrink the pane when dragged upwards', () => {
    stubPaneHeight(300);

    drag(150, 100);

    assert.strictEqual(harness.element('tablePane').style.flex, '0 0 250px');
  });

  test('should keep a minimum height for the table pane', () => {
    stubPaneHeight(300);

    drag(100, -500);

    assert.strictEqual(harness.element('tablePane').style.flex, '0 0 60px');
  });

  test('should stop resizing after the button is released', () => {
    stubPaneHeight(300);
    drag(100, 150);

    const window = harness.window;
    window.document.dispatchEvent(new window.MouseEvent('mousemove', { clientY: 400, bubbles: true }));

    assert.strictEqual(harness.element('tablePane').style.flex, '0 0 350px');
  });
});

suite('SvgContent - Webview runtime - exportImage', () => {
  let harness: WebviewHarness;

  teardown(() => harness.dispose());

  test('should rasterize at 2x for a chart within the size limit', async () => {
    harness = createWebview();
    const canvases = stubRasterization(harness, { width: 800, height: 600 });

    harness.send({ command: 'exportImage', format: 'png', requestId: 'r1' });
    await harness.settle();

    assert.strictEqual(canvases.length, 1);
    assert.strictEqual(canvases[0].width, 1600);
    assert.strictEqual(canvases[0].height, 1200);
    assert.deepStrictEqual(canvases[0].drawn, { width: 1600, height: 1200 });
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

    // 倍率が小数になるため、Canvas寸法と描画寸法がずれやすいのはこのケース
    assert.deepStrictEqual(
      canvases[0].drawn,
      { width: canvases[0].width, height: canvases[0].height },
      'the drawn size must match the canvas size'
    );
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
