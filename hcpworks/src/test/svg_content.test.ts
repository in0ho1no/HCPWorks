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
      { caption: '', rows: [['名称', '目的'], ['ループカウンタ', '繰り返す']] },
    ];
    content.setTables(tables);
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('<table class="hcp-table">'), 'Should include the table element');
    assert.ok(html.includes('<th>名称</th>'), 'First row should be header cells');
    assert.ok(html.includes('<td>ループカウンタ</td>'), 'Following rows should be data cells');
  });

  test('should render the table caption when present', () => {
    const content = new SvgContent();
    content.setTables([{ caption: 'データ定義', rows: [['a']] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('<caption>データ定義</caption>'), 'Should include the caption');
  });

  test('should escape HTML special characters in cells', () => {
    const content = new SvgContent();
    content.setTables([{ caption: '', rows: [['<b> & "x"']] }]);
    const html = content.getHtmlWrappedSvg();

    assert.ok(html.includes('&lt;b&gt; &amp; &quot;x&quot;'), 'Should escape special characters');
    assert.ok(!html.includes('<b> & "x"'), 'Should not contain raw special characters');
  });

  test('should not render a table element when no tables set', () => {
    const content = new SvgContent();
    content.setSvgContent('<svg></svg>');
    const html = content.getHtmlWrappedSvg();

    assert.ok(!html.includes('<table'), 'Should not include any table element');
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
