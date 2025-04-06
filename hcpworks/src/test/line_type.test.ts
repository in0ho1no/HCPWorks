import * as assert from 'assert';

import { LineTypeFormat, LineTypeEnum, LineTypeDefine, LineType } from '../line_type';

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
