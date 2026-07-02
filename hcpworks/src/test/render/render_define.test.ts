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

  test('should contain all expected colors in declaration order', () => {
    // Okabe-Ito配色ベース(青, 朱, 緑, 赤紫, 山吹, 紫, 空色, 濃青緑)
    const expected = ['0072B2', 'D55E00', '009E73', 'CC79A7', 'E69F00', '800080', '56B4E9', '008B8B'];
    assert.deepStrictEqual(DiagramDefine.WIRE_COLOR_TABLE, expected);
  });

  test('should not contain pure black to keep wires distinct from structural lines', () => {
    assert.ok(!DiagramDefine.WIRE_COLOR_TABLE.includes('000000'));
  });

  test('should contain only valid uppercase RRGGBB values', () => {
    for (const color of DiagramDefine.WIRE_COLOR_TABLE) {
      assert.match(color, /^[0-9A-F]{6}$/, `invalid color format: ${color}`);
    }
  });
});
