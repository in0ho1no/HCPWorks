import * as assert from 'assert';
import { DiagramDefine } from '../../render/render_define';

suite('DiagramDefine - Constants - DEFAULT_BG_COLOR', () => {
  test('should be "FFFFFF"', () => {
    assert.strictEqual(DiagramDefine.DEFAULT_BG_COLOR, 'FFFFFF');
  });
});

suite('DiagramDefine - Constants - LEVEL_SHIFT', () => {
  test('should be 30', () => {
    assert.strictEqual(DiagramDefine.LEVEL_SHIFT, 30);
  });
});

suite('DiagramDefine - Constants - IMG_MARGIN', () => {
  test('should be 30', () => {
    assert.strictEqual(DiagramDefine.IMG_MARGIN, 30);
  });
});

suite('DiagramDefine - Constants - LINE_OFFSET', () => {
  test('should be 10', () => {
    assert.strictEqual(DiagramDefine.LINE_OFFSET, 10);
  });
});

suite('DiagramDefine - Constants - WIRE_COLOR_TABLE', () => {
  test('should have 8 colors', () => {
    assert.strictEqual(DiagramDefine.WIRE_COLOR_TABLE.length, 8);
  });

  test('first color should be black "000000"', () => {
    assert.strictEqual(DiagramDefine.WIRE_COLOR_TABLE[0], '000000');
  });

  test('second color should be red "FF0000"', () => {
    assert.strictEqual(DiagramDefine.WIRE_COLOR_TABLE[1], 'FF0000');
  });

  test('third color should be green "00FF00"', () => {
    assert.strictEqual(DiagramDefine.WIRE_COLOR_TABLE[2], '00FF00');
  });

  test('fourth color should be blue "0000FF"', () => {
    assert.strictEqual(DiagramDefine.WIRE_COLOR_TABLE[3], '0000FF');
  });

  test('fifth color should be yellow "FFFF00"', () => {
    assert.strictEqual(DiagramDefine.WIRE_COLOR_TABLE[4], 'FFFF00');
  });

  test('sixth color should be purple "800080"', () => {
    assert.strictEqual(DiagramDefine.WIRE_COLOR_TABLE[5], '800080');
  });

  test('seventh color should be orange "FFA500"', () => {
    assert.strictEqual(DiagramDefine.WIRE_COLOR_TABLE[6], 'FFA500');
  });

  test('eighth color should be turquoise "40E0D0"', () => {
    assert.strictEqual(DiagramDefine.WIRE_COLOR_TABLE[7], '40E0D0');
  });

  test('should contain all expected colors', () => {
    const expected = ['000000', 'FF0000', '00FF00', '0000FF', 'FFFF00', '800080', 'FFA500', '40E0D0'];
    assert.deepStrictEqual(DiagramDefine.WIRE_COLOR_TABLE, expected);
  });
});
