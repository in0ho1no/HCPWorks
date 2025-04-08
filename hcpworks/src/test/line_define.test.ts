import * as assert from 'assert';

import { LineTypeFormat, LineTypeEnum, LineTypeDefine } from '../line_define';

suite('LineTypeFormat - Class', () => {
  test('should be initialized correctly', () => {
    const format = new LineTypeFormat(1, '\\test');
    assert.strictEqual(format.type_value, 1);
    assert.strictEqual(format.type_format, '\\test');

    const defaultFormat = new LineTypeFormat();
    assert.strictEqual(defaultFormat.type_value, 0);
    assert.strictEqual(defaultFormat.type_format, '');
  });
});

suite('LineTypeDefine - Method - get_format_by_type', () => {
  test(' should return correct format', () => {
    const normalFormat = LineTypeDefine.get_format_by_type(LineTypeEnum.NORMAL);
    assert.strictEqual(normalFormat.type_value, 0);
    assert.strictEqual(normalFormat.type_format, '');

    const forkFormat = LineTypeDefine.get_format_by_type(LineTypeEnum.FORK);
    assert.strictEqual(forkFormat.type_value, 1);
    assert.strictEqual(forkFormat.type_format, '\\fork');
  });
});

suite('LineTypeDefine - Method - get_type_by_format', () => {
  test('should return correct type', () => {
    assert.strictEqual(LineTypeDefine.get_type_by_format('\\fork'), LineTypeEnum.FORK);
    assert.strictEqual(LineTypeDefine.get_type_by_format('\\repeat'), LineTypeEnum.REPEAT);
    assert.strictEqual(LineTypeDefine.get_type_by_format('\\mod'), LineTypeEnum.MOD);
    assert.strictEqual(LineTypeDefine.get_type_by_format('\\return'), LineTypeEnum.RETURN);
    assert.strictEqual(LineTypeDefine.get_type_by_format('\\true'), LineTypeEnum.TRUE);
    assert.strictEqual(LineTypeDefine.get_type_by_format('\\false'), LineTypeEnum.FALSE);
    assert.strictEqual(LineTypeDefine.get_type_by_format('\\branch'), LineTypeEnum.BRANCH);
    assert.strictEqual(LineTypeDefine.get_type_by_format('\\data'), LineTypeEnum.DATA);
    assert.strictEqual(LineTypeDefine.get_type_by_format('\\module'), LineTypeEnum.MODULE);

    // Non-existent format should return undefined
    assert.strictEqual(LineTypeDefine.get_type_by_format('\\nonexistent'), undefined);
    assert.strictEqual(LineTypeDefine.get_type_by_format(''), undefined);
  });
});
