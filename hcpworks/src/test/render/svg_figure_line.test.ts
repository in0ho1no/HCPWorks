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
