import * as assert from 'assert';
import { SvgFigureLines } from '../../render/svg_figure_line';
import { SvgFigureDefine } from '../../render/svg_figure_define';

suite('SvgFigureLines - Method - svgLine', () => {
  test('should include correct x1 y1 x2 y2 attributes', () => {
    const result = SvgFigureLines.svgLine(10, 20, 30, 40);
    assert.ok(result.includes('x1="10"'));
    assert.ok(result.includes('y1="20"'));
    assert.ok(result.includes('x2="30"'));
    assert.ok(result.includes('y2="40"'));
  });

  test('should include default stroke color #000000', () => {
    const result = SvgFigureLines.svgLine(0, 0, 10, 10);
    assert.ok(result.includes('stroke="#000000"'));
  });

  test('should use custom color', () => {
    const result = SvgFigureLines.svgLine(0, 0, 10, 10, 'FF0000');
    assert.ok(result.includes('stroke="#FF0000"'));
  });

  test('should start with <line tag', () => {
    const result = SvgFigureLines.svgLine(0, 0, 5, 5);
    assert.ok(result.startsWith('<line '));
  });

  test('should end with LINE_BREAK', () => {
    const result = SvgFigureLines.svgLine(0, 0, 5, 5);
    assert.ok(result.endsWith(SvgFigureDefine.LINE_BREAK));
  });

  test('should include /> closing tag', () => {
    const result = SvgFigureLines.svgLine(0, 0, 5, 5);
    assert.ok(result.includes('/>'));
  });
});

suite('SvgFigureLines - Method - drawLineH', () => {
  test('should produce horizontal line: y1 = y2 = startY', () => {
    const result = SvgFigureLines.drawLineH(10, 20, 50);
    assert.ok(result.includes('y1="20"'));
    assert.ok(result.includes('y2="20"'));
  });

  test('should produce correct x2 = x1 + length', () => {
    const result = SvgFigureLines.drawLineH(10, 20, 50);
    assert.ok(result.includes('x1="10"'));
    assert.ok(result.includes('x2="60"'));
  });

  test('should use default black color', () => {
    const result = SvgFigureLines.drawLineH(0, 0, 10);
    assert.ok(result.includes('stroke="#000000"'));
  });

  test('should use custom color', () => {
    const result = SvgFigureLines.drawLineH(0, 0, 10, '0000FF');
    assert.ok(result.includes('stroke="#0000FF"'));
  });

  test('should produce a <line element', () => {
    const result = SvgFigureLines.drawLineH(0, 0, 100);
    assert.ok(result.includes('<line '));
  });
});

suite('SvgFigureLines - Method - drawLineV', () => {
  test('should produce vertical line: x1 = x2 = startX', () => {
    const result = SvgFigureLines.drawLineV(15, 25, 40);
    assert.ok(result.includes('x1="15"'));
    assert.ok(result.includes('x2="15"'));
  });

  test('should produce correct y2 = y1 + length', () => {
    const result = SvgFigureLines.drawLineV(15, 25, 40);
    assert.ok(result.includes('y1="25"'));
    assert.ok(result.includes('y2="65"'));
  });

  test('should use default black color', () => {
    const result = SvgFigureLines.drawLineV(0, 0, 10);
    assert.ok(result.includes('stroke="#000000"'));
  });

  test('should use custom color', () => {
    const result = SvgFigureLines.drawLineV(0, 0, 10, '00FF00');
    assert.ok(result.includes('stroke="#00FF00"'));
  });

  test('should produce a <line element', () => {
    const result = SvgFigureLines.drawLineV(0, 0, 50);
    assert.ok(result.includes('<line '));
  });
});

suite('SvgFigureLines - Method - drawArrowR', () => {
  test('should contain a <line element', () => {
    const result = SvgFigureLines.drawArrowR(0, 0, 50);
    assert.ok(result.includes('<line '));
  });

  test('should contain a <path element for arrow head', () => {
    const result = SvgFigureLines.drawArrowR(0, 0, 50);
    assert.ok(result.includes('<path '));
  });

  test('should use the specified color', () => {
    const result = SvgFigureLines.drawArrowR(0, 0, 50, 'FF0000');
    assert.ok(result.includes('stroke="#FF0000"'));
    assert.ok(result.includes('fill="#FF0000"'));
  });

  test('should point to endX = startX + length', () => {
    const result = SvgFigureLines.drawArrowR(10, 20, 50);
    // The line should go to x2 = 60
    assert.ok(result.includes('x2="60"'));
  });

  test('should contain both M and L path commands', () => {
    const result = SvgFigureLines.drawArrowR(0, 0, 30);
    assert.ok(result.includes(' M '));
    assert.ok(result.includes(' L '));
  });
});

suite('SvgFigureLines - Method - drawArrowL', () => {
  test('should contain a <line element', () => {
    const result = SvgFigureLines.drawArrowL(0, 0, 50);
    assert.ok(result.includes('<line '));
  });

  test('should contain a <path element for arrow head', () => {
    const result = SvgFigureLines.drawArrowL(0, 0, 50);
    assert.ok(result.includes('<path '));
  });

  test('should use the specified color', () => {
    const result = SvgFigureLines.drawArrowL(0, 0, 50, 'FF0000');
    assert.ok(result.includes('stroke="#FF0000"'));
    assert.ok(result.includes('fill="#FF0000"'));
  });

  test('arrow head should point to startX', () => {
    // The path M starts at startX, startY
    const result = SvgFigureLines.drawArrowL(10, 20, 50);
    assert.ok(result.includes(`M 10 20`));
  });

  test('should contain both M and L path commands', () => {
    const result = SvgFigureLines.drawArrowL(0, 0, 30);
    assert.ok(result.includes(' M '));
    assert.ok(result.includes(' L '));
  });
});

suite('SvgFigureLines - Method - drawLevelStart', () => {
  test('should return a string containing 2 <line elements', () => {
    const result = SvgFigureLines.drawLevelStart(50, 100);
    const lineCount = (result.match(/<line /g) || []).length;
    assert.strictEqual(lineCount, 2);
  });

  test('should contain a vertical line', () => {
    // Vertical line: x1 = x2
    const result = SvgFigureLines.drawLevelStart(50, 100);
    assert.ok(result.includes(`x1="50"`));
    assert.ok(result.includes(`x2="50"`));
  });

  test('should contain a horizontal line at the top', () => {
    // Horizontal line: y1 = y2
    const result = SvgFigureLines.drawLevelStart(50, 100);
    // vLineTop = centerY - CIRCLE_R - FIGURE_SPACE = 100 - 9 - 9 = 82
    const vLineTop = 100 - SvgFigureDefine.CIRCLE_R - SvgFigureDefine.FIGURE_SPACE;
    assert.ok(result.includes(`y1="${vLineTop}"`));
  });
});

suite('SvgFigureLines - Method - drawLevelEnd', () => {
  test('should return a string containing 2 <line elements', () => {
    const result = SvgFigureLines.drawLevelEnd(50, 100);
    const lineCount = (result.match(/<line /g) || []).length;
    assert.strictEqual(lineCount, 2);
  });

  test('should contain a vertical line below the center', () => {
    const result = SvgFigureLines.drawLevelEnd(50, 100);
    // circleBottom = 100 + 9 = 109
    assert.ok(result.includes(`y1="${100 + SvgFigureDefine.CIRCLE_R}"`));
  });

  test('should contain a horizontal line at the bottom', () => {
    const result = SvgFigureLines.drawLevelEnd(50, 100);
    // vLineBottom = circleBottom + FIGURE_SPACE = 109 + 9 = 118
    const vLineBottom = 100 + SvgFigureDefine.CIRCLE_R + SvgFigureDefine.FIGURE_SPACE;
    assert.ok(result.includes(`y1="${vLineBottom}"`));
  });
});

suite('SvgFigureLines - Method - drawLevelStep', () => {
  test('should return a string containing 3 <line elements', () => {
    const result = SvgFigureLines.drawLevelStep(50, 100);
    const lineCount = (result.match(/<line /g) || []).length;
    assert.strictEqual(lineCount, 3);
  });

  test('should contain the top vertical line', () => {
    const result = SvgFigureLines.drawLevelStep(50, 100);
    // vLineTop = 100 - 9 - 9 = 82, svgLineTopV at x=50
    assert.ok(result.includes(`x1="50"`));
  });

  test('should contain the left-shifted horizontal line', () => {
    const result = SvgFigureLines.drawLevelStep(50, 100);
    // circleLeft = 50 - 9 = 41, hLineLShift = 41 - 9 = 32
    const hLineLShift = 50 - SvgFigureDefine.CIRCLE_R - SvgFigureDefine.FIGURE_SPACE;
    assert.ok(result.includes(`x1="${hLineLShift}"`));
  });
});

suite('SvgFigureLines - Method - buildHPathD', () => {
  test('should produce a straight path for no jumps', () => {
    const d = SvgFigureLines.buildHPathD(10, 50, 100, [], 4);
    assert.strictEqual(d, 'M 10 50 L 100 50');
  });

  test('should insert a semicircular arc for a single jump', () => {
    const d = SvgFigureLines.buildHPathD(10, 50, 100, [{ startX: 46, endX: 54 }], 4);
    assert.strictEqual(d, 'M 10 50 L 46 50 A 4 4 0 0 1 54 50 L 100 50');
  });

  test('should widen the arc for a merged bridge', () => {
    const d = SvgFigureLines.buildHPathD(10, 50, 100, [{ startX: 46, endX: 64 }], 4);
    assert.strictEqual(d, 'M 10 50 L 46 50 A 9 4 0 0 1 64 50 L 100 50');
  });

  test('should handle multiple jumps in order', () => {
    const jumps = [{ startX: 20, endX: 28 }, { startX: 60, endX: 68 }];
    const d = SvgFigureLines.buildHPathD(10, 50, 100, jumps, 4);
    assert.strictEqual(d,
      'M 10 50 L 20 50 A 4 4 0 0 1 28 50 L 60 50 A 4 4 0 0 1 68 50 L 100 50');
  });

  test('should omit leading/trailing L when jump touches the segment ends', () => {
    const d = SvgFigureLines.buildHPathD(10, 50, 100, [{ startX: 10, endX: 18 }], 4);
    assert.strictEqual(d, 'M 10 50 A 4 4 0 0 1 18 50 L 100 50');
  });
});

suite('SvgFigureLines - Method - drawLineHWithJumps', () => {
  test('should delegate to drawLineH when no jumps', () => {
    const result = SvgFigureLines.drawLineHWithJumps(10, 20, 50, [], 'FF0000');
    assert.strictEqual(result, SvgFigureLines.drawLineH(10, 20, 50, 'FF0000'));
  });

  test('should produce a <path element with fill none for jumps', () => {
    const result = SvgFigureLines.drawLineHWithJumps(10, 20, 90, [{ startX: 46, endX: 54 }], 'FF0000');
    assert.ok(result.startsWith('<path d="'));
    assert.ok(result.includes('A 4 4 0 0 1 54 20'));
    assert.ok(result.includes('stroke="#FF0000"'));
    assert.ok(result.includes('fill="none"'));
    assert.ok(!result.includes('<line '));
  });
});

suite('SvgFigureLines - Method - drawArrowRWithJumps', () => {
  test('should delegate to drawArrowR when no jumps', () => {
    const result = SvgFigureLines.drawArrowRWithJumps(10, 20, 50, [], 'FF0000');
    assert.strictEqual(result, SvgFigureLines.drawArrowR(10, 20, 50, 'FF0000'));
  });

  test('should keep the arrow head at endX with jumps', () => {
    const result = SvgFigureLines.drawArrowRWithJumps(10, 20, 90, [{ startX: 46, endX: 54 }], 'FF0000');
    assert.ok(result.includes('fill="none"'), 'jumped line should not be filled');
    assert.ok(result.includes(`M 100 20 `), 'arrow head should start at endX');
    assert.ok(result.includes('fill="#FF0000"'), 'arrow head keeps its fill');
  });
});

suite('SvgFigureLines - Method - drawArrowLWithJumps', () => {
  test('should delegate to drawArrowL when no jumps', () => {
    const result = SvgFigureLines.drawArrowLWithJumps(10, 20, 50, [], 'FF0000');
    assert.strictEqual(result, SvgFigureLines.drawArrowL(10, 20, 50, 'FF0000'));
  });

  test('should keep the arrow head at startX with jumps', () => {
    const result = SvgFigureLines.drawArrowLWithJumps(10, 20, 90, [{ startX: 46, endX: 54 }], 'FF0000');
    assert.ok(result.includes('fill="none"'), 'jumped line should not be filled');
    assert.ok(result.includes(`M 10 20 `), 'arrow head should start at startX');
    assert.ok(result.includes('fill="#FF0000"'), 'arrow head keeps its fill');
  });
});

suite('SvgFigureLines - Regression - arrow output unchanged after helper extraction', () => {
  test('drawArrowR output should keep the exact legacy format', () => {
    const result = SvgFigureLines.drawArrowR(10, 20, 50, 'FF0000');
    const arrowHead = SvgFigureDefine.ARROW_HEAD;
    const half = Math.ceil(arrowHead / 2);
    const expected =
      `<line x1="10" y1="20" x2="60" y2="20" stroke="#FF0000"/>${SvgFigureDefine.LINE_BREAK}` +
      `<path d="M 60 20 L ${60 - arrowHead} ${20 - half} M 60 20 L ${60 - arrowHead} ${20 + half}" ` +
      `stroke="#FF0000" fill="#FF0000" />${SvgFigureDefine.LINE_BREAK}`;
    assert.strictEqual(result, expected);
  });

  test('drawArrowL output should keep the exact legacy format', () => {
    const result = SvgFigureLines.drawArrowL(10, 20, 50, 'FF0000');
    const arrowHead = SvgFigureDefine.ARROW_HEAD;
    const half = Math.ceil(arrowHead / 2);
    const expected =
      `<line x1="10" y1="20" x2="60" y2="20" stroke="#FF0000"/>${SvgFigureDefine.LINE_BREAK}` +
      `<path d="M 10 20 L ${10 + arrowHead} ${20 - half} M 10 20 L ${10 + arrowHead} ${20 + half}" ` +
      `stroke="#FF0000" fill="#FF0000" />${SvgFigureDefine.LINE_BREAK}`;
    assert.strictEqual(result, expected);
  });
});
