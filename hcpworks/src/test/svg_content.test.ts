import * as assert from 'assert';
import { SvgContent } from '../svg_content';
import { TableData } from '../parse/file_parse';

suite('SvgContent - Constructor - default values', () => {
  test('should initialize with empty name', () => {
    const content = new SvgContent();
    assert.strictEqual(content.getName(), '');
  });

  test('should initialize with empty textContent array', () => {
    const content = new SvgContent();
    assert.deepStrictEqual(content.getTextContent(), []);
  });

  test('should initialize with empty svgContent', () => {
    const content = new SvgContent();
    assert.strictEqual(content.getSvgContent(), '');
  });
});

suite('SvgContent - Method - setName / getName', () => {
  test('should set and get name', () => {
    const content = new SvgContent();
    content.setName('myModule');
    assert.strictEqual(content.getName(), 'myModule');
  });

  test('should update name on second call', () => {
    const content = new SvgContent();
    content.setName('first');
    content.setName('second');
    assert.strictEqual(content.getName(), 'second');
  });

  test('should allow setting empty string', () => {
    const content = new SvgContent();
    content.setName('name');
    content.setName('');
    assert.strictEqual(content.getName(), '');
  });

  test('should return this for method chaining', () => {
    const content = new SvgContent();
    const result = content.setName('test');
    assert.strictEqual(result, content);
  });
});

suite('SvgContent - Method - setTextContent / getTextContent', () => {
  test('should set and get text content array', () => {
    const content = new SvgContent();
    const texts = ['line1', 'line2', 'line3'];
    content.setTextContent(texts);
    assert.deepStrictEqual(content.getTextContent(), texts);
  });

  test('should set empty array', () => {
    const content = new SvgContent();
    content.setTextContent([]);
    assert.deepStrictEqual(content.getTextContent(), []);
  });

  test('should update text content on second call', () => {
    const content = new SvgContent();
    content.setTextContent(['old']);
    content.setTextContent(['new1', 'new2']);
    assert.deepStrictEqual(content.getTextContent(), ['new1', 'new2']);
  });

  test('should return this for method chaining', () => {
    const content = new SvgContent();
    const result = content.setTextContent(['a', 'b']);
    assert.strictEqual(result, content);
  });
});

suite('SvgContent - Method - setSvgContent / getSvgContent', () => {
  test('should set and get svg content', () => {
    const content = new SvgContent();
    const svg = '<svg><rect/></svg>';
    content.setSvgContent(svg);
    assert.strictEqual(content.getSvgContent(), svg);
  });

  test('should update svg content on second call', () => {
    const content = new SvgContent();
    content.setSvgContent('<svg>first</svg>');
    content.setSvgContent('<svg>second</svg>');
    assert.strictEqual(content.getSvgContent(), '<svg>second</svg>');
  });

  test('should allow setting empty string', () => {
    const content = new SvgContent();
    content.setSvgContent('<svg>x</svg>');
    content.setSvgContent('');
    assert.strictEqual(content.getSvgContent(), '');
  });

  test('should return this for method chaining', () => {
    const content = new SvgContent();
    const result = content.setSvgContent('<svg/>');
    assert.strictEqual(result, content);
  });
});

suite('SvgContent - Method - getHtmlWrappedSvg', () => {
  test('should include DOCTYPE declaration', () => {
    const content = new SvgContent();
    content.setSvgContent('<svg></svg>');
    const html = content.getHtmlWrappedSvg();
    assert.ok(html.includes('<!DOCTYPE html>'), 'Should include DOCTYPE');
  });

  test('should embed the svg content string', () => {
    const content = new SvgContent();
    const svgStr = '<svg xmlns="http://www.w3.org/2000/svg"><circle/></svg>';
    content.setSvgContent(svgStr);
    const html = content.getHtmlWrappedSvg();
    assert.ok(html.includes(svgStr), 'HTML should contain the SVG string');
  });

  test('should include "HCP Preview" as page title', () => {
    const content = new SvgContent();
    content.setSvgContent('');
    const html = content.getHtmlWrappedSvg();
    assert.ok(html.includes('HCP Preview'), 'HTML should include page title');
  });

  test('should include svg-container class', () => {
    const content = new SvgContent();
    content.setSvgContent('');
    const html = content.getHtmlWrappedSvg();
    assert.ok(html.includes('svg-container'), 'HTML should include svg-container class');
  });

  test('should include wheel event listener for zoom', () => {
    const content = new SvgContent();
    content.setSvgContent('');
    const html = content.getHtmlWrappedSvg();
    assert.ok(html.includes('wheel'), 'HTML should include wheel event listener');
  });

  test('should include dblclick reset handler', () => {
    const content = new SvgContent();
    content.setSvgContent('');
    const html = content.getHtmlWrappedSvg();
    assert.ok(html.includes('dblclick'), 'HTML should include dblclick handler');
  });

  test('should acquire the vscode api for messaging', () => {
    const content = new SvgContent();
    content.setSvgContent('');
    const html = content.getHtmlWrappedSvg();
    assert.ok(html.includes('acquireVsCodeApi()'), 'HTML should acquire the vscode api');
  });

  test('should include an exportImage message handler', () => {
    const content = new SvgContent();
    content.setSvgContent('');
    const html = content.getHtmlWrappedSvg();
    assert.ok(html.includes('exportImage'), 'HTML should handle exportImage requests');
    assert.ok(html.includes('exportImageResult'), 'HTML should post back exportImageResult');
  });

  test('should rasterize the svg via canvas', () => {
    const content = new SvgContent();
    content.setSvgContent('');
    const html = content.getHtmlWrappedSvg();
    assert.ok(html.includes('createElement(\'canvas\')'), 'HTML should create a canvas for rasterization');
    assert.ok(html.includes('toDataURL(mime)'), 'HTML should export the canvas using the requested mime type');
  });

  test('should map png, jpeg and webp formats to mime types', () => {
    const content = new SvgContent();
    content.setSvgContent('');
    const html = content.getHtmlWrappedSvg();
    assert.ok(html.includes('image/png'), 'HTML should support png');
    assert.ok(html.includes('image/jpeg'), 'HTML should support jpeg');
    assert.ok(html.includes('image/webp'), 'HTML should support webp');
  });

  test('should reflect updated svg when called after setSvgContent', () => {
    const content = new SvgContent();
    content.setSvgContent('<svg>A</svg>');
    const html1 = content.getHtmlWrappedSvg();
    content.setSvgContent('<svg>B</svg>');
    const html2 = content.getHtmlWrappedSvg();
    assert.ok(html1.includes('<svg>A</svg>'));
    assert.ok(html2.includes('<svg>B</svg>'));
    assert.notStrictEqual(html1, html2);
  });

  test('should use empty string for svg when none set', () => {
    const content = new SvgContent();
    const html = content.getHtmlWrappedSvg();
    assert.ok(typeof html === 'string', 'Should return a string even with empty svg');
    assert.ok(html.includes('<!DOCTYPE html>'));
  });

  test('should render a table with header and data cells', () => {
    const content = new SvgContent();
    const tables: TableData[] = [
      {
        caption: '',
        rows: [
          { cells: ['名称', '目的'], depth: 0 },
          { cells: ['ループカウンタ', '繰り返す'], depth: 0 },
        ],
      },
    ];
    content.setTables(tables);
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('<table class="hcp-table">'), 'Should include the table element');
    assert.ok(html.includes('<th>名称</th>'), 'First row should be header cells');
    assert.ok(html.includes('<td>ループカウンタ</td>'), 'Following rows should be data cells');
  });

  test('should render the table caption when present', () => {
    const content = new SvgContent();
    content.setTables([{ caption: 'データ定義', rows: [{ cells: ['a'], depth: 0 }] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('<caption>データ定義</caption>'), 'Should include the caption');
  });

  test('should indent the first cell with full-width spaces according to row depth', () => {
    const content = new SvgContent();
    content.setTables([
      {
        caption: '',
        rows: [
          { cells: ['名称'], depth: 0 }, // ヘッダー行
          { cells: ['記録'], depth: 0 },
          { cells: ['年月日'], depth: 1 },
          { cells: ['年'], depth: 2 },
        ],
      },
    ]);
    const html = content.getHtmlWrappedSvg();

    // depth 0 は字下げ無し、depth>0 は全角スペース×depth を前置(Excel貼付でも残る実文字)
    assert.ok(html.includes('<td>記録</td>'), 'Depth 0 cell should have no indentation');
    assert.ok(html.includes('<td>　年月日</td>'), 'Depth 1 cell should be prefixed with one full-width space');
    assert.ok(html.includes('<td>　　年</td>'), 'Depth 2 cell should be prefixed with two full-width spaces');
    assert.ok(!html.includes('padding-left'), 'Should no longer use CSS padding for indentation');
  });

  test('should escape HTML special characters in cells', () => {
    const content = new SvgContent();
    content.setTables([{ caption: '', rows: [{ cells: ['<b> & "x"'], depth: 0 }] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('&lt;b&gt; &amp; &quot;x&quot;'), 'Should escape special characters');
    assert.ok(!html.includes('<b> & "x"'), 'Should not contain raw special characters');
  });

  test('should convert <br> in a cell to a real line break', () => {
    const content = new SvgContent();
    content.setTables([{ caption: '', rows: [{ cells: ['作業日時を記録<br>（年月日）'], depth: 0 }] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('作業日時を記録<br>（年月日）'), 'Should keep <br> as a real line break');
  });

  test('should accept <br/> and <br /> variants', () => {
    const content = new SvgContent();
    content.setTables([{ caption: '', rows: [{ cells: ['a<br/>b<br />c'], depth: 0 }] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('a<br>b<br>c'), 'Should normalize <br/> and <br /> to <br>');
  });

  test('should still escape other HTML around a <br>', () => {
    const content = new SvgContent();
    content.setTables([{ caption: '', rows: [{ cells: ['<b><br>x'], depth: 0 }] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('&lt;b&gt;<br>x'), 'Should escape surrounding HTML but keep <br>');
    assert.ok(!html.includes('<b>'), 'Should not contain a raw <b> tag');
  });

  test('should render <ins> and <del> decorations in table cells', () => {
    const content = new SvgContent();
    content.setTables([
      {
        caption: '',
        rows: [
          { cells: ['名前', '変更'], depth: 0 },
          { cells: ['項目', '前<ins>追加</ins>中<del>削除</del>後'], depth: 0 },
        ],
      },
    ]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(
      html.includes('前<ins class="hcp-deco-ins">追加</ins>中<del class="hcp-deco-del">削除</del>後'),
      'Should render ins and del decorations in cell content'
    );
    assert.ok(html.includes('background-color: #c9ffc4'), 'Should include insertion highlight style');
    assert.ok(html.includes('background-color: #ffc9c4'), 'Should include deletion highlight style');
    assert.ok(html.includes('color: #1f1f1f'), 'Should include high-contrast decoration text color');
    assert.ok(html.includes('text-decoration: line-through'), 'Should include deletion strikethrough style');
    assert.ok(html.includes('text-decoration-color: #1f1f1f'), 'Should include high-contrast strikethrough color');
  });

  test('should render sequential decorations in a table cell', () => {
    const content = new SvgContent();
    content.setTables([{ caption: '', rows: [{ cells: ['<del>旧</del><ins>新</ins>'], depth: 0 }] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(
      html.includes('<th><del class="hcp-deco-del">旧</del><ins class="hcp-deco-ins">新</ins></th>'),
      'Should render sequential non-nested decorations'
    );
  });

  test('should keep escaping HTML special characters inside table cell decorations', () => {
    const content = new SvgContent();
    content.setTables([{ caption: '', rows: [{ cells: ['<ins><b> & "x"</ins>'], depth: 0 }] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(
      html.includes('<ins class="hcp-deco-ins">&lt;b&gt; &amp; &quot;x&quot;</ins>'),
      'Should escape special characters inside decoration content'
    );
    assert.ok(!html.includes('<b> & "x"'), 'Should not contain raw HTML inside decorations');
  });

  test('should combine table cell decorations with <br> line breaks', () => {
    const content = new SvgContent();
    content.setTables([{ caption: '', rows: [{ cells: ['a<ins>b</ins><br><del>c</del>d'], depth: 0 }] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(
      html.includes('a<ins class="hcp-deco-ins">b</ins><br><del class="hcp-deco-del">c</del>d'),
      'Should render decorations on both sides of a line break'
    );
  });

  test('should show escaped raw table cell text with error style for invalid decorations', () => {
    const content = new SvgContent();
    content.setTables([{ caption: '', rows: [{ cells: ['<ins>a<del>b</del>c</ins>'], depth: 0 }] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('class="hcp-deco-error"'), 'Should mark invalid notation as an error');
    assert.ok(
      html.includes('&lt;ins&gt;a&lt;del&gt;b&lt;/del&gt;c&lt;/ins&gt;'),
      'Should show escaped raw text for invalid notation'
    );
    assert.ok(!html.includes('<ins>a<del>b</del>c</ins>'), 'Should not contain raw invalid HTML');
  });

  test('should show escaped raw table cell text for an unclosed decoration tag', () => {
    const content = new SvgContent();
    content.setTables([{ caption: '', rows: [{ cells: ['before<del>after'], depth: 0 }] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('class="hcp-deco-error"'), 'Should mark unclosed notation as an error');
    assert.ok(html.includes('before&lt;del&gt;after'), 'Should show escaped raw text');
    assert.ok(!html.includes('before<del>after'), 'Should not contain raw invalid HTML');
  });

  test('should not render a table element when no tables set', () => {
    const content = new SvgContent();
    content.setSvgContent('<svg></svg>');
    const html = content.getHtmlWrappedSvg();

    assert.ok(!html.includes('<table'), 'Should not include any table element');
  });

  test('should include split-container, svgPane and svgContainer in the layout', () => {
    const content = new SvgContent();
    content.setSvgContent('<svg></svg>');
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('split-container'), 'Should include split-container');
    assert.ok(html.includes('id="svgPane"'), 'Should include svgPane');
    assert.ok(html.includes('id="svgContainer"'), 'Should include svgContainer');
  });

  test('should hide table-pane and splitter when no tables are set', () => {
    const content = new SvgContent();
    content.setSvgContent('<svg></svg>');
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('id="tablePane"'), 'Should include tablePane element');
    assert.ok(html.includes('id="splitter"'), 'Should include splitter element');
    // テーブルが無い場合、table-pane と splitter は display:none で非表示になる
    const tablePaneMatch = html.match(/id="tablePane"[^>]*style="([^"]*)"/);
    const splitterMatch = html.match(/id="splitter"[^>]*style="([^"]*)"/);
    assert.ok(tablePaneMatch && tablePaneMatch[1].includes('display:none'), 'tablePane should be hidden');
    assert.ok(splitterMatch && splitterMatch[1].includes('display:none'), 'splitter should be hidden');
  });

  test('should show table-pane and splitter when tables are set', () => {
    const content = new SvgContent();
    content.setTables([{ caption: '', rows: [{ cells: ['A'], depth: 0 }] }]);
    const html = content.getHtmlWrappedSvg();

    const tablePaneMatch = html.match(/id="tablePane"[^>]*style="([^"]*)"/);
    const splitterMatch = html.match(/id="splitter"[^>]*style="([^"]*)"/);
    // テーブルがある場合は display:none が付かない(空スタイル)
    assert.ok(!tablePaneMatch || !tablePaneMatch[1].includes('display:none'), 'tablePane should be visible');
    assert.ok(!splitterMatch || !splitterMatch[1].includes('display:none'), 'splitter should be visible');
  });

  test('should attach zoom wheel listener to svgPane, not document', () => {
    const content = new SvgContent();
    content.setSvgContent('');
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes("svgPane.addEventListener('wheel'"), 'Zoom should be bound to svgPane');
    assert.ok(!html.includes("document.addEventListener('wheel'"), 'Zoom should not be bound to document');
  });

  test('should include row-resize cursor for the splitter drag handler', () => {
    const content = new SvgContent();
    content.setSvgContent('');
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('row-resize'), 'Splitter drag should use row-resize cursor');
  });
});

suite('SvgContent - Method chaining', () => {
  test('should support full method chain and retain all values', () => {
    const content = new SvgContent();
    const result = content
      .setName('testModule')
      .setTextContent(['line1', 'line2'])
      .setSvgContent('<svg/>');
    assert.strictEqual(result, content);
    assert.strictEqual(content.getName(), 'testModule');
    assert.deepStrictEqual(content.getTextContent(), ['line1', 'line2']);
    assert.strictEqual(content.getSvgContent(), '<svg/>');
  });

  test('multiple instances should be independent', () => {
    const c1 = new SvgContent();
    const c2 = new SvgContent();
    c1.setName('A').setSvgContent('<svg>A</svg>');
    c2.setName('B').setSvgContent('<svg>B</svg>');
    assert.strictEqual(c1.getName(), 'A');
    assert.strictEqual(c2.getName(), 'B');
    assert.strictEqual(c1.getSvgContent(), '<svg>A</svg>');
    assert.strictEqual(c2.getSvgContent(), '<svg>B</svg>');
  });
});
