import * as assert from 'assert';

import { IOTypeFormat, IOTypeEnum, IOTypeDefine } from '../../parse/data_define';

suite('IOTypeFormat - Class', () => {
  test('should be initialized correctly', () => {
    const format = new IOTypeFormat(1, '\\test');
    assert.strictEqual(format.type_value, 1);
    assert.strictEqual(format.type_format, '\\test');

    const defaultFormat = new IOTypeFormat();
    assert.strictEqual(defaultFormat.type_value, 0);
    assert.strictEqual(defaultFormat.type_format, '');
  });
});

suite('IOTypeDefine - Method - get_format_by_type', () => {
  test(' should return correct format', () => {
    const normalFormat = IOTypeDefine.get_format_by_type(IOTypeEnum.IN);
    assert.strictEqual(normalFormat.type_value, 0);
    assert.strictEqual(normalFormat.type_format, '\\in');

    const forkFormat = IOTypeDefine.get_format_by_type(IOTypeEnum.OUT);
    assert.strictEqual(forkFormat.type_value, 1);
    assert.strictEqual(forkFormat.type_format, '\\out');
  });
});

suite('IOTypeDefine - Method - get_type_by_format', () => {
  test('should return correct type', () => {
    assert.strictEqual(IOTypeDefine.get_type_by_format('\\in'), IOTypeEnum.IN);
    assert.strictEqual(IOTypeDefine.get_type_by_format('\\out'), IOTypeEnum.OUT);

    // Non-existent format should return undefined
    assert.strictEqual(IOTypeDefine.get_type_by_format('\\nonexistent'), undefined);
    assert.strictEqual(IOTypeDefine.get_type_by_format(''), undefined);
  });
});
