import * as assert from 'assert';
import { SVGRenderer } from '../../render/render_main';
import { ParseInfo4Render } from '../../parse/parse_info_4_render';
import { ProcessLineProcessor } from '../../parse/line_info_list_process';
import { DataLineProcessor } from '../../parse/line_info_list_data';
import { LineInfo } from '../../parse/line_info';
import { DiagramDefine } from '../../render/render_define';

function makeLineInfo(text: string): LineInfo {
  const li = new LineInfo();
  li.setTextOrg(text);
  li.updateLevel();
  li.updateType();
  li.updateLineIO();
  return li;
}

function makeRenderer(name: string = 'TestModule'): SVGRenderer {
  const processLines = ProcessLineProcessor.process([makeLineInfo('processA')], 10);
  const dataLines = DataLineProcessor.process([]);
  const parseInfo = new ParseInfo4Render(processLines, dataLines);
  return new SVGRenderer(name, parseInfo);
}

suite('SVGRenderer - Method - checkColorFormat', () => {
  test('should return uppercase color for #RRGGBB format', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat('#ff8800'), 'FF8800');
  });

  test('should return uppercase color for RRGGBB format without hash', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat('ff8800'), 'FF8800');
  });

  test('should return uppercase #RRGGBB', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat('#AABBCC'), 'AABBCC');
  });

  test('should normalize lowercase to uppercase', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat('aabbcc'), 'AABBCC');
  });

  test('should strip surrounding whitespace before check', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat('  #FFFFFF  '), 'FFFFFF');
  });

  test('should return null for invalid string', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat('invalid'), null);
  });

  test('should return null for 3-digit short hex', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat('#FFF'), null);
  });

  test('should return null for empty string', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat(''), null);
  });

  test('should return null for null input', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat(null as unknown as string), null);
  });

  test('should return null for 7-digit hex (one too many)', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat('#FFFFFFF'), null);
  });

  test('should return null for 5-digit hex', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat('FFFFF'), null);
  });

  test('should return null for non-hex characters', () => {
    const renderer = makeRenderer();
    assert.strictEqual(renderer.checkColorFormat('#GGHHII'), null);
  });
});

suite('SVGRenderer - Method - getSvgBgColor / setSvgBgColor', () => {
  test('should return default background color initially', () => {
    const renderer = makeRenderer();
    const expected = DiagramDefine.DEFAULT_BG_COLOR.replace('#', '');
    assert.strictEqual(renderer.getSvgBgColor(), expected);
  });

  test('should return updated color after setting valid #RRGGBB color', () => {
    const renderer = makeRenderer();
    renderer.setSvgBgColor('#123456');
    assert.strictEqual(renderer.getSvgBgColor(), '123456');
  });

  test('should return updated color after setting valid RRGGBB color', () => {
    const renderer = makeRenderer();
    renderer.setSvgBgColor('ABCDEF');
    assert.strictEqual(renderer.getSvgBgColor(), 'ABCDEF');
  });

  test('should not change color after setting invalid color', () => {
    const renderer = makeRenderer();
    const before = renderer.getSvgBgColor();
    renderer.setSvgBgColor('notacolor');
    assert.strictEqual(renderer.getSvgBgColor(), before);
  });

  test('setSvgBgColor should return this for method chaining with valid color', () => {
    const renderer = makeRenderer();
    const result = renderer.setSvgBgColor('#FFFFFF');
    assert.strictEqual(result, renderer);
  });

  test('setSvgBgColor should return this for method chaining with invalid color', () => {
    const renderer = makeRenderer();
    const result = renderer.setSvgBgColor('bad');
    assert.strictEqual(result, renderer);
  });
});

suite('SVGRenderer - Method - getWireColorTable / setWireColorTable', () => {
  test('should return default wire color table initially', () => {
    const renderer = makeRenderer();
    const expected = DiagramDefine.WIRE_COLOR_TABLE.map(c => c.replace('#', ''));
    assert.deepStrictEqual(renderer.getWireColorTable(), expected);
  });

  test('should return updated table after setting valid colors', () => {
    const renderer = makeRenderer();
    renderer.setWireColorTable(['#FF0000', '#00FF00']);
    assert.deepStrictEqual(renderer.getWireColorTable(), ['FF0000', '00FF00']);
  });

  test('should not change table after setting empty array', () => {
    const renderer = makeRenderer();
    const before = renderer.getWireColorTable();
    renderer.setWireColorTable([]);
    assert.deepStrictEqual(renderer.getWireColorTable(), before);
  });

  test('should filter out invalid colors from table', () => {
    const renderer = makeRenderer();
    renderer.setWireColorTable(['#FF0000', 'invalid', '#00FF00']);
    assert.deepStrictEqual(renderer.getWireColorTable(), ['FF0000', '00FF00']);
  });

  test('should not change table when all colors are invalid', () => {
    const renderer = makeRenderer();
    const before = renderer.getWireColorTable();
    renderer.setWireColorTable(['bad1', 'bad2']);
    assert.deepStrictEqual(renderer.getWireColorTable(), before);
  });

  test('setWireColorTable should return this for method chaining', () => {
    const renderer = makeRenderer();
    const result = renderer.setWireColorTable(['#FF0000']);
    assert.strictEqual(result, renderer);
  });

  test('should accept single color table', () => {
    const renderer = makeRenderer();
    renderer.setWireColorTable(['#AAAAAA']);
    assert.deepStrictEqual(renderer.getWireColorTable(), ['AAAAAA']);
  });
});

suite('SVGRenderer - Method - setTitle', () => {
  test('should include module name in returned SVG text', () => {
    const renderer = makeRenderer('MyModule');
    const [, , svgText] = renderer.setTitle(10, 10);
    assert.ok(svgText.includes('MyModule'), 'SVG title should contain module name');
  });

  test('should include "Name:" prefix in SVG text', () => {
    const renderer = makeRenderer('TestMod');
    const [, , svgText] = renderer.setTitle(10, 10);
    assert.ok(svgText.includes('Name:'), 'SVG title should contain "Name:" prefix');
  });

  test('should return positive endX', () => {
    const renderer = makeRenderer('Module');
    const [endX] = renderer.setTitle(10, 10);
    assert.ok(endX > 0, 'endX should be positive');
  });

  test('should return positive endY', () => {
    const renderer = makeRenderer('Module');
    const [, endY] = renderer.setTitle(10, 10);
    assert.ok(endY > 0, 'endY should be positive');
  });

  test('should return string as third element', () => {
    const renderer = makeRenderer('Module');
    const [, , svgText] = renderer.setTitle(0, 0);
    assert.ok(typeof svgText === 'string');
  });
});

suite('SVGRenderer - Method - setElements', () => {
  test('should return element count matching line count', () => {
    const processLines = ProcessLineProcessor.process([
      makeLineInfo('processA'),
      makeLineInfo('processB'),
    ], 10);
    const dataLines = DataLineProcessor.process([]);
    const parseInfo = new ParseInfo4Render(processLines, dataLines);
    const renderer = new SVGRenderer('Test', parseInfo);

    const elements = renderer.setElements(50, 50, processLines);
    assert.strictEqual(elements.length, 2);
  });

  test('should stack elements at increasing y positions', () => {
    const processLines = ProcessLineProcessor.process([
      makeLineInfo('processA'),
      makeLineInfo('processB'),
      makeLineInfo('processC'),
    ], 10);
    const dataLines = DataLineProcessor.process([]);
    const parseInfo = new ParseInfo4Render(processLines, dataLines);
    const renderer = new SVGRenderer('Test', parseInfo);

    const elements = renderer.setElements(50, 50, processLines);
    assert.ok(elements[0].getY() < elements[1].getY());
    assert.ok(elements[1].getY() < elements[2].getY());
  });

  test('should return empty array for empty processor', () => {
    const processLines = ProcessLineProcessor.process([], 10);
    const dataLines = DataLineProcessor.process([]);
    const parseInfo = new ParseInfo4Render(processLines, dataLines);
    const renderer = new SVGRenderer('Test', parseInfo);

    const elements = renderer.setElements(50, 50, processLines);
    assert.strictEqual(elements.length, 0);
  });

  test('should set x based on startX and level', () => {
    const processLines = ProcessLineProcessor.process([
      makeLineInfo('processA'),
    ], 10);
    const dataLines = DataLineProcessor.process([]);
    const parseInfo = new ParseInfo4Render(processLines, dataLines);
    const renderer = new SVGRenderer('Test', parseInfo);

    const elements = renderer.setElements(100, 50, processLines);
    assert.ok(elements[0].getX() >= 100, 'x should be at least startX');
  });
});

suite('SVGRenderer - Method - render', () => {
  test('should return string containing <svg tag', () => {
    const renderer = makeRenderer('SimpleModule');
    const svg = renderer.render();
    assert.ok(svg.includes('<svg'), 'Output should contain <svg tag');
  });

  test('should return string containing </svg>', () => {
    const renderer = makeRenderer('SimpleModule');
    const svg = renderer.render();
    assert.ok(svg.includes('</svg>'), 'Output should end with </svg>');
  });

  test('should update getSvgWidth to positive value after render', () => {
    const renderer = makeRenderer('SimpleModule');
    assert.strictEqual(renderer.getSvgWidth(), 0);
    renderer.render();
    assert.ok(renderer.getSvgWidth() > 0, 'svgWidth should be positive after render');
  });

  test('should update getSvgHeight to positive value after render', () => {
    const renderer = makeRenderer('SimpleModule');
    assert.strictEqual(renderer.getSvgHeight(), 0);
    renderer.render();
    assert.ok(renderer.getSvgHeight() > 0, 'svgHeight should be positive after render');
  });

  test('should include set background color in rendered svg', () => {
    const renderer = makeRenderer('Module');
    renderer.setSvgBgColor('#ABCDEF');
    const svg = renderer.render();
    assert.ok(svg.includes('ABCDEF'), 'SVG should include the background color');
  });

  test('should include module name in rendered svg', () => {
    const renderer = makeRenderer('UniqueModuleName');
    const svg = renderer.render();
    assert.ok(svg.includes('UniqueModuleName'), 'SVG should include module name');
  });

  test('should render with data lines', () => {
    const processLines = ProcessLineProcessor.process([
      makeLineInfo('    processA \\in dataX \\out dataY'),
    ], 10);
    const dataLines = DataLineProcessor.process([
      makeLineInfo('\\data dataX'),
      makeLineInfo('\\data dataY'),
    ]);
    const parseInfo = new ParseInfo4Render(processLines, dataLines);
    const renderer = new SVGRenderer('WithData', parseInfo);
    const svg = renderer.render();
    assert.ok(svg.includes('<svg'), 'Should produce valid SVG with data lines');
  });
});

suite('SVGRenderer - Method - drawModuleMeta', () => {
  test('should include kind and scope values with labels in rendered svg', () => {
    const renderer = makeRenderer('MetaModule')
      .setModuleMeta({ kind: '新規作成', scope: '公開関数' });
    const svg = renderer.render();
    assert.ok(svg.includes('scope: 公開関数'), 'SVG should include the labeled scope line');
    assert.ok(svg.includes('kind: 新規作成'), 'SVG should include the labeled kind line');
  });

  test('should not break rendering when meta is empty', () => {
    const renderer = makeRenderer('NoMeta').setModuleMeta({ kind: '', scope: '' });
    const svg = renderer.render();
    assert.ok(svg.includes('<svg'), 'Should still produce valid SVG without meta');
  });

  test('setModuleMeta should return the renderer for chaining', () => {
    const renderer = makeRenderer('Chain');
    assert.strictEqual(renderer.setModuleMeta({ kind: 'a', scope: 'b' }), renderer);
  });

  test('should render only the provided value when one is empty', () => {
    const renderer = makeRenderer('OneMeta').setModuleMeta({ kind: '既存変更', scope: '' });
    const svg = renderer.render();
    assert.ok(svg.includes('kind: 既存変更'), 'SVG should include the labeled kind line');
    assert.ok(!svg.includes('scope:'), 'SVG should not include an empty scope line');
  });
});
