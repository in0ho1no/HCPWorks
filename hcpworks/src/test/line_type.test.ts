import * as assert from 'assert';

import { LineTypeEnum, LineTypeDefine } from '../line_define';
import { LineType } from '../line_type';

suite('LineType - Method - get_line_type', () => {
  test('should return NORMAL for empty line', () => {
    const [emptyLineFormat, emptyLineRemainder] = LineType.get_line_type('');
    assert.strictEqual(emptyLineFormat.type_value, 0);
    assert.strictEqual(emptyLineFormat.type_format, '');
    assert.strictEqual(emptyLineRemainder, '');
  });

  test('should return NORMAL for normal line', () => {
    const [normalLineFormat, normalLineRemainder] = LineType.get_line_type('This is a normal line');
    assert.strictEqual(normalLineFormat.type_value, 0);
    assert.strictEqual(normalLineFormat.type_format, '');
    assert.strictEqual(normalLineRemainder, 'This is a normal line');
  });

  test('should correctly parse lines with type specifier', () => {
    const testCases = [
      { input: '\\fork test fork', expected: { type: LineTypeEnum.FORK, remainder: 'test fork' } },
      { input: '\\repeat loop 10 times', expected: { type: LineTypeEnum.REPEAT, remainder: 'loop 10 times' } },
      { input: '\\mod apply modification', expected: { type: LineTypeEnum.MOD, remainder: 'apply modification' } },
      { input: '\\return result', expected: { type: LineTypeEnum.RETURN, remainder: 'result' } },
      { input: '\\true condition satisfied', expected: { type: LineTypeEnum.TRUE, remainder: 'condition satisfied' } },
      { input: '\\false condition failed', expected: { type: LineTypeEnum.FALSE, remainder: 'condition failed' } },
      { input: '\\branch new branch', expected: { type: LineTypeEnum.BRANCH, remainder: 'new branch' } },
      { input: '\\data values', expected: { type: LineTypeEnum.DATA, remainder: 'values' } },
      { input: '\\module imported', expected: { type: LineTypeEnum.MODULE, remainder: 'imported' } },
    ];

    for (const testCase of testCases) {
      const [format, remainder] = LineType.get_line_type(testCase.input);
      const expectedFormat = LineTypeDefine.get_format_by_type(testCase.expected.type);

      assert.strictEqual(format.type_format, expectedFormat.type_format);
      assert.strictEqual(format.type_value, expectedFormat.type_value);
      assert.strictEqual(remainder, testCase.expected.remainder);
    }
  });

  test('should handle lines with only type specifier', () => {
    const [onlyCommandFormat, onlyCommandRemainder] = LineType.get_line_type('\\fork');
    const expectedFormat = LineTypeDefine.get_format_by_type(LineTypeEnum.FORK);
    assert.strictEqual(onlyCommandFormat.type_value, expectedFormat.type_value);
    assert.strictEqual(onlyCommandFormat.type_format, expectedFormat.type_format);
    assert.strictEqual(onlyCommandRemainder, '');
  });

  test('should handle lines with unknown type specifier', () => {
    const [unknownLineFormat, unknownLineRemainder] = LineType.get_line_type('\\unknown test');
    assert.strictEqual(unknownLineFormat.type_value, 0);
    assert.strictEqual(unknownLineFormat.type_format, '');
    assert.strictEqual(unknownLineRemainder, '\\unknown test');
  });

  test('should handle lines with leading spaces', () => {
    const [paddedLineFormat, paddedLineRemainder] = LineType.get_line_type('    \\fork test with spaces');
    const expectedFormat = LineTypeDefine.get_format_by_type(LineTypeEnum.FORK);
    assert.strictEqual(paddedLineFormat.type_value, expectedFormat.type_value);
    assert.strictEqual(paddedLineFormat.type_format, expectedFormat.type_format);
    assert.strictEqual(paddedLineRemainder, 'test with spaces');
  });
});
