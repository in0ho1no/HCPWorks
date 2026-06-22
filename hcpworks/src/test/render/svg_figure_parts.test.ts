import * as assert from 'assert';
import { SvgFigureParts } from '../../render/svg_figure_parts';
import { SvgFigureDefine } from '../../render/svg_figure_define';

suite('SvgFigureParts - Method - svgCircle', () => {
  test('should return a <circle element', () => {
    const result = SvgFigureParts.svgCircle(50, 100, 9);
    assert.ok(result.includes('<circle '));
  });

  test('should contain correct cx, cy, r attributes', () => {
    const result = SvgFigureParts.svgCircle(50, 100, 9);
    assert.ok(result.includes('cx="50"'));
    assert.ok(result.includes('cy="100"'));
    assert.ok(result.includes('r="9"'));
  });

  test('should have fill="#FFFFFF"', () => {
    const result = SvgFigureParts.svgCircle(0, 0, 5);
    assert.ok(result.includes('fill="#FFFFFF"'));
  });

  test('should have stroke="#000000"', () => {
    const result = SvgFigureParts.svgCircle(0, 0, 5);
    assert.ok(result.includes('stroke="#000000"'));
  });

  test('should end with LINE_BREAK', () => {
    const result = SvgFigureParts.svgCircle(0, 0, 9);
    assert.ok(result.endsWith(SvgFigureDefine.LINE_BREAK));
  });
});

suite('SvgFigureParts - Method - svgRect', () => {
  test('should return a <rect element', () => {
    const result = SvgFigureParts.svgRect(50, 100);
    assert.ok(result.includes('<rect '));
  });

  test('should position upper-left corner at (cx - CIRCLE_R, cy - CIRCLE_R)', () => {
    const cx = 50;
    const cy = 100;
    const result = SvgFigureParts.svgRect(cx, cy);
    assert.ok(result.includes(`x="${cx - SvgFigureDefine.CIRCLE_R}"`));
    assert.ok(result.includes(`y="${cy - SvgFigureDefine.CIRCLE_R}"`));
  });

  test('should have width = FIGURE_WIDTH and height = FIGURE_HEIGHT', () => {
    const result = SvgFigureParts.svgRect(50, 100);
    assert.ok(result.includes(`width="${SvgFigureDefine.FIGURE_WIDTH}"`));
    assert.ok(result.includes(`height="${SvgFigureDefine.FIGURE_HEIGHT}"`));
  });

  test('should have fill="#FFFFFF" and stroke="#000000"', () => {
    const result = SvgFigureParts.svgRect(50, 100);
    assert.ok(result.includes('fill="#FFFFFF"'));
    assert.ok(result.includes('stroke="#000000"'));
  });

  test('should end with LINE_BREAK', () => {
    const result = SvgFigureParts.svgRect(0, 0);
    assert.ok(result.endsWith(SvgFigureDefine.LINE_BREAK));
  });
});

suite('SvgFigureParts - Method - getVerticesPolygon', () => {
  test('should return the correct number of vertices', () => {
    const vertices = SvgFigureParts.getVerticesPolygon(3, 0, 0, 10);
    assert.strictEqual(vertices.length, 3);
  });

  test('should return 6 vertices for hexagon', () => {
    const vertices = SvgFigureParts.getVerticesPolygon(6, 50, 50, 10);
    assert.strictEqual(vertices.length, 6);
  });

  test('all vertices should be at distance = radius from center (within rounding)', () => {
    const cx = 50;
    const cy = 50;
    const radius = 10;
    const vertices = SvgFigureParts.getVerticesPolygon(3, cx, cy, radius);
    for (const [x, y] of vertices) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      // Allow rounding error of ±1
      assert.ok(Math.abs(dist - radius) <= 1, `vertex (${x},${y}) distance ${dist} is not close to ${radius}`);
    }
  });

  test('should return tuples of [number, number]', () => {
    const vertices = SvgFigureParts.getVerticesPolygon(4, 0, 0, 5);
    for (const v of vertices) {
      assert.strictEqual(v.length, 2);
      assert.strictEqual(typeof v[0], 'number');
      assert.strictEqual(typeof v[1], 'number');
    }
  });

  test('rotation=0 first vertex should be at (cx + radius, cy)', () => {
    const cx = 50;
    const cy = 50;
    const radius = 10;
    const vertices = SvgFigureParts.getVerticesPolygon(4, cx, cy, radius, 0);
    // angle=0 -> x = cx + radius * cos(0) = cx + radius, y = cy + radius * sin(0) = cy
    assert.strictEqual(vertices[0][0], Math.round(cx + radius));
    assert.strictEqual(vertices[0][1], Math.round(cy));
  });
});

suite('SvgFigureParts - Method - drawFigureNormal', () => {
  test('should return [endX, svgString] tuple', () => {
    const result = SvgFigureParts.drawFigureNormal(50, 100, 'test');
    assert.strictEqual(result.length, 2);
    assert.strictEqual(typeof result[0], 'number');
    assert.strictEqual(typeof result[1], 'string');
  });

  test('should include a <circle element in svg', () => {
    const [, svg] = SvgFigureParts.drawFigureNormal(50, 100, 'test');
    assert.ok(svg.includes('<circle '));
  });

  test('should include text element when text is provided', () => {
    const [, svg] = SvgFigureParts.drawFigureNormal(50, 100, 'hello');
    assert.ok(svg.includes('<text '));
    assert.ok(svg.includes('hello'));
  });

  test('endX should be greater than cx when text is provided', () => {
    const cx = 50;
    const [endX] = SvgFigureParts.drawFigureNormal(cx, 100, 'hello');
    assert.ok(endX > cx);
  });

  test('should work without text argument', () => {
    const [endX, svg] = SvgFigureParts.drawFigureNormal(50, 100);
    assert.strictEqual(typeof endX, 'number');
    assert.ok(svg.includes('<circle '));
  });

  test('endX with empty text should be startX (circle edge + space)', () => {
    const cx = 50;
    const [endX] = SvgFigureParts.drawFigureNormal(cx, 100, '');
    // startX = cx + CIRCLE_R + SPACE_FIGURE_TO_TEXT, drawString with '' returns [startX, '']
    const expectedEndX = cx + SvgFigureDefine.CIRCLE_R + SvgFigureDefine.SPACE_FIGURE_TO_TEXT;
    assert.strictEqual(endX, expectedEndX);
  });
});

suite('SvgFigureParts - Method - drawFigureFork', () => {
  test('should include a <circle element', () => {
    const [, svg] = SvgFigureParts.drawFigureFork(50, 100, 'test');
    assert.ok(svg.includes('<circle '));
  });

  test('should include a <polygon element for the triangle', () => {
    const [, svg] = SvgFigureParts.drawFigureFork(50, 100, 'test');
    assert.ok(svg.includes('<polygon '));
  });

  test('should include text element when text is provided', () => {
    const [, svg] = SvgFigureParts.drawFigureFork(50, 100, 'condition');
    assert.ok(svg.includes('<text '));
    assert.ok(svg.includes('condition'));
  });

  test('should return [endX, svg] tuple', () => {
    const result = SvgFigureParts.drawFigureFork(50, 100, 'test');
    assert.strictEqual(result.length, 2);
    assert.strictEqual(typeof result[0], 'number');
    assert.strictEqual(typeof result[1], 'string');
  });
});

suite('SvgFigureParts - Method - drawFigureRepeat', () => {
  test('should include a <circle element', () => {
    const [, svg] = SvgFigureParts.drawFigureRepeat(50, 100, 'loop');
    assert.ok(svg.includes('<circle '));
  });

  test('should include a <path element for the arc arrow', () => {
    const [, svg] = SvgFigureParts.drawFigureRepeat(50, 100);
    assert.ok(svg.includes('<path '));
  });

  test('should return [endX, svg] tuple', () => {
    const result = SvgFigureParts.drawFigureRepeat(50, 100, 'test');
    assert.strictEqual(result.length, 2);
  });
});

suite('SvgFigureParts - Method - drawFigureMod', () => {
  test('should include two <circle elements (outer and inner)', () => {
    const [, svg] = SvgFigureParts.drawFigureMod(50, 100, 'func');
    const circleCount = (svg.match(/<circle /g) || []).length;
    assert.strictEqual(circleCount, 2);
  });

  test('should return [endX, svg] tuple', () => {
    const result = SvgFigureParts.drawFigureMod(50, 100);
    assert.strictEqual(result.length, 2);
  });
});

suite('SvgFigureParts - Method - drawFigureReturn', () => {
  test('should include a <polygon element (triangle)', () => {
    const [, svg] = SvgFigureParts.drawFigureReturn(50, 100, 'break');
    assert.ok(svg.includes('<polygon '));
  });

  test('should include a <line element (vertical)', () => {
    const [, svg] = SvgFigureParts.drawFigureReturn(50, 100);
    assert.ok(svg.includes('<line '));
  });

  test('should return [endX, svg] tuple', () => {
    const result = SvgFigureParts.drawFigureReturn(50, 100, 'test');
    assert.strictEqual(result.length, 2);
  });
});

suite('SvgFigureParts - Method - drawFigureData', () => {
  test('should include a <rect element', () => {
    const [, svg] = SvgFigureParts.drawFigureData(50, 100, 'myData');
    assert.ok(svg.includes('<rect '));
  });

  test('should include text element when text is provided', () => {
    const [, svg] = SvgFigureParts.drawFigureData(50, 100, 'myData');
    assert.ok(svg.includes('<text '));
    assert.ok(svg.includes('myData'));
  });

  test('should return [endX, svg] tuple', () => {
    const result = SvgFigureParts.drawFigureData(50, 100, 'data');
    assert.strictEqual(result.length, 2);
    assert.strictEqual(typeof result[0], 'number');
    assert.strictEqual(typeof result[1], 'string');
  });

  test('endX should be greater than cx when text is provided', () => {
    const cx = 50;
    const [endX] = SvgFigureParts.drawFigureData(cx, 100, 'someData');
    assert.ok(endX > cx);
  });
});

suite('SvgFigureParts - Method - drawFigureTrue', () => {
  test('should prefix text with "(true) "', () => {
    const [, svg] = SvgFigureParts.drawFigureTrue(50, 100, 'condition');
    assert.ok(svg.includes('(true) condition'));
  });

  test('should prefix with "(true) " even when text is empty', () => {
    const [, svg] = SvgFigureParts.drawFigureTrue(50, 100, '');
    assert.ok(svg.includes('(true) '));
  });

  test('should return [endX, svg] tuple', () => {
    const result = SvgFigureParts.drawFigureTrue(50, 100, 'x > 0');
    assert.strictEqual(result.length, 2);
  });
});

suite('SvgFigureParts - Method - drawFigureFalse', () => {
  test('should prefix text with "(false) "', () => {
    const [, svg] = SvgFigureParts.drawFigureFalse(50, 100, 'condition');
    assert.ok(svg.includes('(false) condition'));
  });

  test('should prefix with "(false) " even when text is empty', () => {
    const [, svg] = SvgFigureParts.drawFigureFalse(50, 100, '');
    assert.ok(svg.includes('(false) '));
  });

  test('should return [endX, svg] tuple', () => {
    const result = SvgFigureParts.drawFigureFalse(50, 100, 'x <= 0');
    assert.strictEqual(result.length, 2);
  });
});

suite('SvgFigureParts - Method - drawFigureBranch', () => {
  test('should wrap text in parentheses', () => {
    const [, svg] = SvgFigureParts.drawFigureBranch(50, 100, 'caseA');
    assert.ok(svg.includes('(caseA)'));
  });

  test('should wrap empty text as "()"', () => {
    const [, svg] = SvgFigureParts.drawFigureBranch(50, 100, '');
    assert.ok(svg.includes('()'));
  });

  test('should return [endX, svg] tuple', () => {
    const result = SvgFigureParts.drawFigureBranch(50, 100, 'case1');
    assert.strictEqual(result.length, 2);
  });
});

suite('SvgFigureParts - Method - drawFigureDataFuncIn', () => {
  test('should return a string containing a <path element', () => {
    const result = SvgFigureParts.drawFigureDataFuncIn(50, 100);
    assert.ok(result.includes('<path '));
  });

  test('should end with LINE_BREAK', () => {
    const result = SvgFigureParts.drawFigureDataFuncIn(50, 100);
    assert.ok(result.endsWith(SvgFigureDefine.LINE_BREAK));
  });

  test('should use fill="#ff00ff" for input indicator', () => {
    const result = SvgFigureParts.drawFigureDataFuncIn(50, 100);
    assert.ok(result.includes('fill="#ff00ff"'));
  });
});

suite('SvgFigureParts - Method - drawFigureDataFuncOut', () => {
  test('should return a string containing a <path element', () => {
    const result = SvgFigureParts.drawFigureDataFuncOut(50, 100);
    assert.ok(result.includes('<path '));
  });

  test('should end with LINE_BREAK', () => {
    const result = SvgFigureParts.drawFigureDataFuncOut(50, 100);
    assert.ok(result.endsWith(SvgFigureDefine.LINE_BREAK));
  });

  test('should use fill="#00ffff" for output indicator', () => {
    const result = SvgFigureParts.drawFigureDataFuncOut(50, 100);
    assert.ok(result.includes('fill="#00ffff"'));
  });
});

suite('SvgFigureParts - Method - drawFigureSupplement', () => {
  test('should return a tuple of [number, string]', () => {
    const [endX, svgText] = SvgFigureParts.drawFigureSupplement(50, 100, '(note)');
    assert.strictEqual(typeof endX, 'number');
    assert.strictEqual(typeof svgText, 'string');
  });

  test('should contain a <text element', () => {
    const [, svgText] = SvgFigureParts.drawFigureSupplement(50, 100, '(note)');
    assert.ok(svgText.includes('<text '));
  });

  test('should use grey fill color', () => {
    const [, svgText] = SvgFigureParts.drawFigureSupplement(50, 100, '(note)');
    assert.ok(svgText.includes('fill="#888888"'));
  });

  test('should use italic font-style', () => {
    const [, svgText] = SvgFigureParts.drawFigureSupplement(50, 100, '(note)');
    assert.ok(svgText.includes('font-style="italic"'));
  });

  test('should not contain a <circle element', () => {
    const [, svgText] = SvgFigureParts.drawFigureSupplement(50, 100, '(note)');
    assert.ok(!svgText.includes('<circle '));
  });

  test('should end with LINE_BREAK', () => {
    const [, svgText] = SvgFigureParts.drawFigureSupplement(50, 100, '(note)');
    assert.ok(svgText.endsWith(SvgFigureDefine.LINE_BREAK));
  });

  test('should return empty string for empty text', () => {
    const [endX, svgText] = SvgFigureParts.drawFigureSupplement(50, 100, '');
    assert.strictEqual(svgText, '');
    assert.ok(endX >= 50);
  });
});
