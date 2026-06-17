import * as assert from 'assert';
import { SvgFigureText } from '../../render/svg_figure_text';
import { SvgFigureDefine } from '../../render/svg_figure_define';

suite('SvgFigureText - Method - calcStringWidth', () => {
  test('should return 0 for empty string', () => {
    assert.strictEqual(SvgFigureText.calcStringWidth(''), 0);
  });

  test('should return 0 for falsy input', () => {
    assert.strictEqual(SvgFigureText.calcStringWidth(''), 0);
  });

  test('should count ASCII characters as 0.5 each (2 chars -> 1)', () => {
    assert.strictEqual(SvgFigureText.calcStringWidth('ab'), 1);
  });

  test('should count ASCII characters with ceiling (1 ASCII -> 1)', () => {
    assert.strictEqual(SvgFigureText.calcStringWidth('a'), 1);
  });

  test('should count 4 ASCII characters as 2', () => {
    assert.strictEqual(SvgFigureText.calcStringWidth('abcd'), 2);
  });

  test('should count 3 ASCII characters as 2 (ceil of 1.5)', () => {
    assert.strictEqual(SvgFigureText.calcStringWidth('abc'), 2);
  });

  test('should count Japanese characters as 1.0 each', () => {
    assert.strictEqual(SvgFigureText.calcStringWidth('あ'), 1);
  });

  test('should count 3 Japanese characters as 3', () => {
    assert.strictEqual(SvgFigureText.calcStringWidth('あいう'), 3);
  });

  test('should handle mixed ASCII and Japanese characters', () => {
    // 'aあ' = 0.5 + 1.0 = 1.5 -> ceil -> 2
    assert.strictEqual(SvgFigureText.calcStringWidth('aあ'), 2);
  });

  test('should handle longer mixed string', () => {
    // 'abあい' = 0.5 + 0.5 + 1.0 + 1.0 = 3.0 -> ceil -> 3
    assert.strictEqual(SvgFigureText.calcStringWidth('abあい'), 3);
  });

  test('should handle all ASCII word', () => {
    // 'hello' = 5 * 0.5 = 2.5 -> ceil -> 3
    assert.strictEqual(SvgFigureText.calcStringWidth('hello'), 3);
  });
});

suite('SvgFigureText - Method - getSvgStringWidth', () => {
  test('should return 0 for empty string', () => {
    assert.strictEqual(SvgFigureText.getSvgStringWidth('', 12), 0);
  });

  test('should return 0 for fontPx = 0', () => {
    assert.strictEqual(SvgFigureText.getSvgStringWidth('abc', 0), 0);
  });

  test('should return 0 for negative fontPx', () => {
    assert.strictEqual(SvgFigureText.getSvgStringWidth('abc', -1), 0);
  });

  test('should accumulate half-width chars by HALF_WIDTH_CHAR_RATIO', () => {
    // 'ab' = 2 * 12 * 0.54 = 12.96 -> ceil -> 13
    assert.strictEqual(SvgFigureText.getSvgStringWidth('ab', 12), 13);
  });

  test('should return correct width for Japanese text', () => {
    // 'あ' = 1 * 12 * 1.0 = 12
    assert.strictEqual(SvgFigureText.getSvgStringWidth('あ', 12), 12);
  });

  test('should return correct width for 4 ASCII chars', () => {
    // 'abcd' = 4 * 10 * 0.55 = 22
    assert.strictEqual(SvgFigureText.getSvgStringWidth('abcd', 10), 22);
  });
});

suite('SvgFigureText - Method - getFontSizePx', () => {
  test('should return FONT_SIZE_PX for 0 percent', () => {
    assert.strictEqual(SvgFigureText.getFontSizePx(0), SvgFigureDefine.FONT_SIZE_PX);
  });

  test('should return FONT_SIZE_PX for negative percent', () => {
    assert.strictEqual(SvgFigureText.getFontSizePx(-10), SvgFigureDefine.FONT_SIZE_PX);
  });

  test('should return 12 for 100%', () => {
    assert.strictEqual(SvgFigureText.getFontSizePx(100), 12);
  });

  test('should return 6 for 50%', () => {
    assert.strictEqual(SvgFigureText.getFontSizePx(50), 6);
  });

  test('should return 24 for 200%', () => {
    assert.strictEqual(SvgFigureText.getFontSizePx(200), 24);
  });

  test('should return default FONT_SIZE_PX when no argument given', () => {
    assert.strictEqual(SvgFigureText.getFontSizePx(), SvgFigureDefine.FONT_SIZE_PX);
  });

  test('should floor the result (150% -> 18)', () => {
    assert.strictEqual(SvgFigureText.getFontSizePx(150), 18);
  });
});

suite('SvgFigureText - Method - svgString', () => {
  test('should return empty string for empty text', () => {
    assert.strictEqual(SvgFigureText.svgString(0, 0, ''), '');
  });

  test('should return SVG text element with correct x and y', () => {
    const result = SvgFigureText.svgString(10, 20, 'hello');
    assert.ok(result.includes('x="10"'));
    assert.ok(result.includes('y="20"'));
  });

  test('should return SVG text element with correct text content', () => {
    const result = SvgFigureText.svgString(0, 0, 'hello');
    assert.ok(result.includes('>hello</text>'));
  });

  test('should include text-anchor="start"', () => {
    const result = SvgFigureText.svgString(0, 0, 'test');
    assert.ok(result.includes('text-anchor="start"'));
  });

  test('should include dominant-baseline="middle"', () => {
    const result = SvgFigureText.svgString(0, 0, 'test');
    assert.ok(result.includes('dominant-baseline="middle"'));
  });

  test('should include font-size with px unit', () => {
    const result = SvgFigureText.svgString(0, 0, 'test', 100);
    assert.ok(result.includes('font-size="12px"'));
  });

  test('should use custom fontSizePercent', () => {
    const result = SvgFigureText.svgString(0, 0, 'test', 200);
    assert.ok(result.includes('font-size="24px"'));
  });

  test('should end with LINE_BREAK', () => {
    const result = SvgFigureText.svgString(0, 0, 'test');
    assert.ok(result.endsWith(SvgFigureDefine.LINE_BREAK));
  });

  test('should escape special XML characters in text', () => {
    const result = SvgFigureText.svgString(0, 0, '<test>');
    assert.ok(result.includes('&lt;test&gt;'));
    assert.ok(!result.includes('<test>'));
  });

  test('should start with <text tag', () => {
    const result = SvgFigureText.svgString(5, 10, 'hello');
    assert.ok(result.startsWith('<text '));
  });
});

suite('SvgFigureText - Method - drawString', () => {
  test('should return [startX, ""] for empty text', () => {
    const [endX, svg] = SvgFigureText.drawString(50, 100, '');
    assert.strictEqual(endX, 50);
    assert.strictEqual(svg, '');
  });

  test('should return correct endX for ASCII text', () => {
    // 'ab' at fontPx=12: textWidth = ceil(2*12*0.54) = 13, endX = startX + 13 + TEXT_MARGIN(15)
    const [endX, svg] = SvgFigureText.drawString(0, 0, 'ab', 100);
    assert.strictEqual(endX, 0 + 13 + SvgFigureDefine.TEXT_MARGIN);
  });

  test('should return SVG text element in the string', () => {
    const [endX, svg] = SvgFigureText.drawString(10, 20, 'hello');
    assert.ok(svg.includes('<text '));
    assert.ok(svg.includes('hello'));
  });

  test('endX should be startX + textWidth + TEXT_MARGIN', () => {
    const startX = 30;
    // 'abcd' at fontPx=12 -> textWidth = ceil(4*12*0.54) = ceil(25.92) = 26
    const [endX, svg] = SvgFigureText.drawString(startX, 0, 'abcd', 100);
    const expectedEndX = startX + 26 + SvgFigureDefine.TEXT_MARGIN;
    assert.strictEqual(endX, expectedEndX);
  });

  test('should use default fontSizePercent of 100', () => {
    const [endX1, svg1] = SvgFigureText.drawString(0, 0, 'test');
    const [endX2, svg2] = SvgFigureText.drawString(0, 0, 'test', 100);
    assert.strictEqual(endX1, endX2);
    assert.strictEqual(svg1, svg2);
  });
});

suite('SvgFigureText - Method - getDecorationDisplayText', () => {
  test('should return empty string for empty input', () => {
    assert.strictEqual(SvgFigureText.getDecorationDisplayText(''), '');
  });

  test('should remove <del> tags on valid input', () => {
    assert.strictEqual(
      SvgFigureText.getDecorationDisplayText('<del>送信する</del>受信解析する'),
      '送信する受信解析する'
    );
  });

  test('should remove <ins> tags on valid input', () => {
    assert.strictEqual(
      SvgFigureText.getDecorationDisplayText('<ins>追加</ins>分'),
      '追加分'
    );
  });

  test('should keep the raw text (tags shown) on error input', () => {
    // 入れ子はエラー扱いなので、タグごと表示文字列として残す
    assert.strictEqual(
      SvgFigureText.getDecorationDisplayText('<ins>a<del>b</del>c</ins>'),
      '<ins>a<del>b</del>c</ins>'
    );
  });

  test('should not change text without tags', () => {
    assert.strictEqual(SvgFigureText.getDecorationDisplayText('hello'), 'hello');
  });
});

suite('SvgFigureText - Method - parseDecorationSegments', () => {
  test('should return empty array for empty input', () => {
    assert.deepStrictEqual(
      SvgFigureText.parseDecorationSegments(''),
      { segments: [], error: false }
    );
  });

  test('should return single plain segment for plain text', () => {
    assert.deepStrictEqual(
      SvgFigureText.parseDecorationSegments('hello'),
      { segments: [{ text: 'hello', deco: '' }], error: false }
    );
  });

  test('should split a <del> segment from surrounding text', () => {
    assert.deepStrictEqual(
      SvgFigureText.parseDecorationSegments('<del>送信する</del>受信解析する'),
      {
        segments: [
          { text: '送信する', deco: 'del' },
          { text: '受信解析する', deco: '' },
        ],
        error: false,
      }
    );
  });

  test('should split a <ins> segment from surrounding text', () => {
    assert.deepStrictEqual(
      SvgFigureText.parseDecorationSegments('前<ins>中</ins>後'),
      {
        segments: [
          { text: '前', deco: '' },
          { text: '中', deco: 'ins' },
          { text: '後', deco: '' },
        ],
        error: false,
      }
    );
  });

  test('should accept sequential (non-nested) <del> and <ins>', () => {
    const result = SvgFigureText.parseDecorationSegments('<del>a</del><ins>b</ins>');
    assert.strictEqual(result.error, false);
    assert.deepStrictEqual(result.segments, [
      { text: 'a', deco: 'del' },
      { text: 'b', deco: 'ins' },
    ]);
  });

  test('should flag a different tag nested inside another as error', () => {
    assert.strictEqual(
      SvgFigureText.parseDecorationSegments('<ins>a<del>b</del>c</ins>').error,
      true
    );
  });

  test('should flag a same tag nested inside itself as error', () => {
    assert.strictEqual(
      SvgFigureText.parseDecorationSegments('<ins>a<ins>b</ins></ins>').error,
      true
    );
  });

  test('should flag a closing tag without an opening as error', () => {
    assert.strictEqual(
      SvgFigureText.parseDecorationSegments('abc</del>').error,
      true
    );
  });

  test('should flag a mismatched closing tag as error', () => {
    assert.strictEqual(
      SvgFigureText.parseDecorationSegments('<ins>abc</del>').error,
      true
    );
  });

  test('should flag an unclosed tag as error', () => {
    assert.strictEqual(
      SvgFigureText.parseDecorationSegments('<ins>abc').error,
      true
    );
  });
});

suite('SvgFigureText - Method - hasDecorationTag', () => {
  test('should be false for plain text', () => {
    assert.strictEqual(SvgFigureText.hasDecorationTag('hello'), false);
  });

  test('should be true when a <del> tag exists', () => {
    assert.strictEqual(SvgFigureText.hasDecorationTag('a<del>b</del>'), true);
  });

  test('should be true when a <ins> tag exists', () => {
    assert.strictEqual(SvgFigureText.hasDecorationTag('a<ins>b</ins>'), true);
  });

  test('should be true even for a lone closing tag (so it can be flagged)', () => {
    assert.strictEqual(SvgFigureText.hasDecorationTag('a</ins>'), true);
  });
});

suite('SvgFigureText - Method - svgString with decoration', () => {
  test('width functions should ignore the decoration tags', () => {
    assert.strictEqual(
      SvgFigureText.getSvgStringWidth('<del>ab</del>', 12),
      SvgFigureText.getSvgStringWidth('ab', 12)
    );
    assert.strictEqual(
      SvgFigureText.getSvgStringWidth('<ins>ab</ins>', 12),
      SvgFigureText.getSvgStringWidth('ab', 12)
    );
  });

  test('should wrap struck text in a line-through tspan with salmon background', () => {
    const result = SvgFigureText.svgString(0, 0, '<del>あ</del>い');
    assert.ok(result.includes('<tspan text-decoration="line-through">あ</tspan>'));
    assert.ok(result.includes(`fill="${SvgFigureDefine.STRIKE_BG_COLOR}"`));
    assert.ok(result.includes('い'));
  });

  test('should highlight inserted text with light-green background and no strikethrough', () => {
    const result = SvgFigureText.svgString(0, 0, '<ins>あ</ins>い');
    assert.ok(result.includes('<rect '));
    assert.ok(result.includes(`fill="${SvgFigureDefine.INSERT_BG_COLOR}"`));
    // <ins>は取り消し線を引かない
    assert.ok(!result.includes('line-through'));
  });

  test('should render an error background and show the raw tags on nested tags', () => {
    const result = SvgFigureText.svgString(0, 0, '<ins>a<del>b</del>c</ins>');
    assert.ok(result.includes(`fill="${SvgFigureDefine.DECORATION_ERROR_BG_COLOR}"`));
    // タグごと(エスケープして)表示し、エラー箇所を可視化する
    assert.ok(result.includes('&lt;ins&gt;'));
    assert.ok(result.includes('&lt;del&gt;'));
  });

  test('should size the background rect with the tighter background ratio', () => {
    // 87 half-width chars at fontPx=12
    const text = 'a'.repeat(87);
    const result = SvgFigureText.svgString(0, 0, `<del>${text}</del>`);
    const expectedBgWidth = SvgFigureText.getSvgStringWidth(
      text, 12, SvgFigureDefine.DECORATION_BG_HALF_WIDTH_RATIO
    );
    assert.ok(result.includes(`width="${expectedBgWidth}"`));
    // 背景の幅はレイアウト用の幅(矢印基準)より狭いこと
    assert.ok(expectedBgWidth < SvgFigureText.getSvgStringWidth(text, 12));
  });

  test('getSvgStringWidth should honor a custom half-width ratio', () => {
    assert.strictEqual(SvgFigureText.getSvgStringWidth('aa', 100, 0.5), 100);
  });

  test('should place the rect before the text so it renders behind', () => {
    const result = SvgFigureText.svgString(0, 0, '<del>あ</del>');
    assert.ok(result.indexOf('<rect ') < result.indexOf('<text '));
  });

  test('should keep plain text output unchanged when no decoration tag', () => {
    const result = SvgFigureText.svgString(0, 0, 'hello');
    assert.ok(result.includes('>hello</text>'));
    assert.ok(!result.includes('<rect '));
    assert.ok(!result.includes('<tspan'));
  });
});

suite('SvgFigureText - Method - escapeXml', () => {
  test('should return empty string for empty input', () => {
    assert.strictEqual(SvgFigureText.escapeXml(''), '');
  });

  test('should escape & as &amp;', () => {
    assert.strictEqual(SvgFigureText.escapeXml('&'), '&amp;');
  });

  test('should escape < as &lt;', () => {
    assert.strictEqual(SvgFigureText.escapeXml('<'), '&lt;');
  });

  test('should escape > as &gt;', () => {
    assert.strictEqual(SvgFigureText.escapeXml('>'), '&gt;');
  });

  test('should escape " as &quot;', () => {
    assert.strictEqual(SvgFigureText.escapeXml('"'), '&quot;');
  });

  test("should escape ' as &apos;", () => {
    assert.strictEqual(SvgFigureText.escapeXml("'"), '&apos;');
  });

  test('should not change regular text', () => {
    assert.strictEqual(SvgFigureText.escapeXml('hello'), 'hello');
  });

  test('should handle mixed special characters', () => {
    const input = '<tag attr="value" key=\'val\'>&text</tag>';
    const result = SvgFigureText.escapeXml(input);
    assert.ok(result.includes('&lt;'));
    assert.ok(result.includes('&gt;'));
    assert.ok(result.includes('&quot;'));
    assert.ok(result.includes('&apos;'));
    assert.ok(result.includes('&amp;'));
    assert.ok(!result.includes('<tag'));
  });

  test('should escape all & before other characters to avoid double escaping', () => {
    const result = SvgFigureText.escapeXml('a&b<c');
    assert.strictEqual(result, 'a&amp;b&lt;c');
  });
});
