import * as assert from 'assert';
import { SvgFigureDefine } from '../../render/svg_figure_define';

suite('SvgFigureDefine - Constants - CIRCLE_R', () => {
  test('should be 9', () => {
    assert.strictEqual(SvgFigureDefine.CIRCLE_R, 9);
  });
});

suite('SvgFigureDefine - Constants - FIGURE_SPACE', () => {
  test('should equal CIRCLE_R (9)', () => {
    assert.strictEqual(SvgFigureDefine.FIGURE_SPACE, SvgFigureDefine.CIRCLE_R);
    assert.strictEqual(SvgFigureDefine.FIGURE_SPACE, 9);
  });
});

suite('SvgFigureDefine - Constants - FIGURE_WIDTH', () => {
  test('should equal CIRCLE_R * 2 (18)', () => {
    assert.strictEqual(SvgFigureDefine.FIGURE_WIDTH, SvgFigureDefine.CIRCLE_R * 2);
    assert.strictEqual(SvgFigureDefine.FIGURE_WIDTH, 18);
  });
});

suite('SvgFigureDefine - Constants - FIGURE_HEIGHT', () => {
  test('should equal CIRCLE_R * 2 (18)', () => {
    assert.strictEqual(SvgFigureDefine.FIGURE_HEIGHT, SvgFigureDefine.CIRCLE_R * 2);
    assert.strictEqual(SvgFigureDefine.FIGURE_HEIGHT, 18);
  });
});

suite('SvgFigureDefine - Constants - ARROW_HEAD', () => {
  test('should be 8', () => {
    assert.strictEqual(SvgFigureDefine.ARROW_HEAD, 8);
  });
});

suite('SvgFigureDefine - Constants - SPACE_FIGURE_TO_TEXT', () => {
  test('should be 10', () => {
    assert.strictEqual(SvgFigureDefine.SPACE_FIGURE_TO_TEXT, 10);
  });
});

suite('SvgFigureDefine - Constants - TEXT_MARGIN', () => {
  test('should be 15', () => {
    assert.strictEqual(SvgFigureDefine.TEXT_MARGIN, 15);
  });
});

suite('SvgFigureDefine - Constants - FONT_SIZE_PX', () => {
  test('should be 12', () => {
    assert.strictEqual(SvgFigureDefine.FONT_SIZE_PX, 12);
  });
});

suite('SvgFigureDefine - Constants - LINE_BREAK', () => {
  test('should be CRLF (\\r\\n)', () => {
    assert.strictEqual(SvgFigureDefine.LINE_BREAK, '\r\n');
  });

  test('should have length 2', () => {
    assert.strictEqual(SvgFigureDefine.LINE_BREAK.length, 2);
  });
});

suite('SvgFigureDefine - Constants - relationships', () => {
  test('FIGURE_WIDTH and FIGURE_HEIGHT should be equal', () => {
    assert.strictEqual(SvgFigureDefine.FIGURE_WIDTH, SvgFigureDefine.FIGURE_HEIGHT);
  });

  test('FIGURE_SPACE and CIRCLE_R should be equal', () => {
    assert.strictEqual(SvgFigureDefine.FIGURE_SPACE, SvgFigureDefine.CIRCLE_R);
  });

  test('FIGURE_WIDTH should be twice CIRCLE_R', () => {
    assert.strictEqual(SvgFigureDefine.FIGURE_WIDTH, SvgFigureDefine.CIRCLE_R * 2);
  });
});
