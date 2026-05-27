import * as assert from 'assert';
import { LineInfo, createCommonDataInfo } from '../../parse/line_info';
import { LineLevel } from '../../parse/line_level';
import { LineTypeEnum, LineTypeDefine } from '../../parse/line_define';

function makeLineInfo(text: string): LineInfo {
  const li = new LineInfo();
  li.setTextOrg(text);
  li.updateLevel();
  li.updateType();
  li.updateLineIO();
  return li;
}

suite('LineInfo - Constructor - default values', () => {
  test('should initialize with default values', () => {
    const li = new LineInfo();
    assert.strictEqual(li.getLevel(), 0);
    assert.strictEqual(li.getTextLessTypeIO(), '');
    assert.strictEqual(li.getLineNo(), 0);
    assert.strictEqual(li.getBeforeLineNo(), LineInfo.DEFAULT_VALUE);
    assert.strictEqual(li.getNextLineNo(), LineInfo.DEFAULT_VALUE);
    assert.deepStrictEqual(li.getInOutData().getInDataList(), []);
    assert.deepStrictEqual(li.getInOutData().getOutDataList(), []);
  });

  test('DEFAULT_VALUE should be -1', () => {
    assert.strictEqual(LineInfo.DEFAULT_VALUE, -1);
  });
});

suite('LineInfo - Method - updateLevel', () => {
  test('should set level 0 for non-indented line', () => {
    const li = new LineInfo();
    li.setTextOrg('processA');
    li.updateLevel();
    assert.strictEqual(li.getLevel(), 0);
  });

  test('should set level 1 for 4-space indented line', () => {
    const li = new LineInfo();
    li.setTextOrg('    processB');
    li.updateLevel();
    assert.strictEqual(li.getLevel(), 1);
  });

  test('should set level 1 for tab-indented line', () => {
    const li = new LineInfo();
    li.setTextOrg('\tprocessC');
    li.updateLevel();
    assert.strictEqual(li.getLevel(), 1);
  });

  test('should set level 2 for 8-space indented line', () => {
    const li = new LineInfo();
    li.setTextOrg('        processD');
    li.updateLevel();
    assert.strictEqual(li.getLevel(), 2);
  });

  test('should set level 2 for double-tab indented line', () => {
    const li = new LineInfo();
    li.setTextOrg('\t\tprocessE');
    li.updateLevel();
    assert.strictEqual(li.getLevel(), 2);
  });

  test('should return LEVEL_NONE for empty text', () => {
    const li = new LineInfo();
    li.setTextOrg('');
    li.updateLevel();
    assert.strictEqual(li.getLevel(), LineLevel.LEVEL_NONE);
  });

  test('should return this for method chaining', () => {
    const li = new LineInfo();
    li.setTextOrg('abc');
    const result = li.updateLevel();
    assert.strictEqual(result, li);
  });
});

suite('LineInfo - Method - setLevel', () => {
  test('should set level correctly', () => {
    const li = new LineInfo();
    li.setLevel(3);
    assert.strictEqual(li.getLevel(), 3);
  });

  test('should set level 0 (LEVEL_MIN)', () => {
    const li = new LineInfo();
    li.setLevel(0);
    assert.strictEqual(li.getLevel(), 0);
  });

  test('should throw error for negative level', () => {
    const li = new LineInfo();
    assert.throws(() => {
      li.setLevel(-1);
    }, /Invalid level value/);
  });

  test('should throw error for level below LEVEL_MIN', () => {
    const li = new LineInfo();
    assert.throws(() => {
      li.setLevel(-5);
    }, /Invalid level value/);
  });

  test('should return this for method chaining', () => {
    const li = new LineInfo();
    const result = li.setLevel(2);
    assert.strictEqual(result, li);
  });
});

suite('LineInfo - Method - updateType', () => {
  test('should set NORMAL type for plain text line', () => {
    const li = new LineInfo();
    li.setTextOrg('processA');
    li.updateType();
    const expectedFormat = LineTypeDefine.get_format_by_type(LineTypeEnum.NORMAL);
    assert.strictEqual(li.getType().type_value, expectedFormat.type_value);
  });

  test('should set FORK type for \\fork line', () => {
    const li = new LineInfo();
    li.setTextOrg('\\fork condition');
    li.updateType();
    const expectedFormat = LineTypeDefine.get_format_by_type(LineTypeEnum.FORK);
    assert.strictEqual(li.getType().type_value, expectedFormat.type_value);
    assert.strictEqual(li.getType().type_format, '\\fork');
  });

  test('should set DATA type for \\data line', () => {
    const li = new LineInfo();
    li.setTextOrg('\\data myData');
    li.updateType();
    const expectedFormat = LineTypeDefine.get_format_by_type(LineTypeEnum.DATA);
    assert.strictEqual(li.getType().type_value, expectedFormat.type_value);
    assert.strictEqual(li.getType().type_format, '\\data');
  });

  test('should set REPEAT type for \\repeat line', () => {
    const li = new LineInfo();
    li.setTextOrg('\\repeat loopCondition');
    li.updateType();
    const expectedFormat = LineTypeDefine.get_format_by_type(LineTypeEnum.REPEAT);
    assert.strictEqual(li.getType().type_value, expectedFormat.type_value);
  });

  test('should set MODULE type for \\module line', () => {
    const li = new LineInfo();
    li.setTextOrg('\\module myModule');
    li.updateType();
    const expectedFormat = LineTypeDefine.get_format_by_type(LineTypeEnum.MODULE);
    assert.strictEqual(li.getType().type_value, expectedFormat.type_value);
  });

  test('should return this for method chaining', () => {
    const li = new LineInfo();
    li.setTextOrg('processA');
    const result = li.updateType();
    assert.strictEqual(result, li);
  });
});

suite('LineInfo - Method - updateLineIO', () => {
  test('should extract single \\in data', () => {
    const li = new LineInfo();
    li.setTextOrg('processA \\in dataX');
    li.updateType();
    li.updateLineIO();
    const inList = li.getInOutData().getInDataList();
    assert.strictEqual(inList.length, 1);
    assert.strictEqual(inList[0].name, 'dataX');
    assert.deepStrictEqual(li.getInOutData().getOutDataList(), []);
  });

  test('should extract single \\out data', () => {
    const li = new LineInfo();
    li.setTextOrg('processB \\out dataY');
    li.updateType();
    li.updateLineIO();
    const outList = li.getInOutData().getOutDataList();
    assert.strictEqual(outList.length, 1);
    assert.strictEqual(outList[0].name, 'dataY');
    assert.deepStrictEqual(li.getInOutData().getInDataList(), []);
  });

  test('should extract multiple \\in and \\out data', () => {
    const li = new LineInfo();
    li.setTextOrg('processC \\in data1 \\in data2 \\out data3');
    li.updateType();
    li.updateLineIO();
    const inList = li.getInOutData().getInDataList();
    const outList = li.getInOutData().getOutDataList();
    assert.strictEqual(inList.length, 2);
    assert.strictEqual(inList[0].name, 'data1');
    assert.strictEqual(inList[1].name, 'data2');
    assert.strictEqual(outList.length, 1);
    assert.strictEqual(outList[0].name, 'data3');
  });

  test('should strip \\in and \\out from textLessTypeIO', () => {
    const li = new LineInfo();
    li.setTextOrg('processD \\in dataA \\out dataB');
    li.updateType();
    li.updateLineIO();
    assert.strictEqual(li.getTextLessTypeIO(), 'processD');
  });

  test('should handle line with no \\in or \\out', () => {
    const li = new LineInfo();
    li.setTextOrg('plainProcess');
    li.updateType();
    li.updateLineIO();
    assert.deepStrictEqual(li.getInOutData().getInDataList(), []);
    assert.deepStrictEqual(li.getInOutData().getOutDataList(), []);
    assert.strictEqual(li.getTextLessTypeIO(), 'plainProcess');
  });

  test('should return this for method chaining', () => {
    const li = new LineInfo();
    li.setTextOrg('processA');
    li.updateType();
    const result = li.updateLineIO();
    assert.strictEqual(result, li);
  });
});

suite('LineInfo - Method - setTextLessTypeIO / getTextLessTypeIO', () => {
  test('should set and get text correctly', () => {
    const li = new LineInfo();
    li.setTextLessTypeIO('someText');
    assert.strictEqual(li.getTextLessTypeIO(), 'someText');
  });

  test('should return this for method chaining', () => {
    const li = new LineInfo();
    const result = li.setTextLessTypeIO('text');
    assert.strictEqual(result, li);
  });
});

suite('LineInfo - Method - setLineNo / getLineNo', () => {
  test('should set and get line number', () => {
    const li = new LineInfo();
    li.setLineNo(5);
    assert.strictEqual(li.getLineNo(), 5);
  });

  test('should set line number to 0', () => {
    const li = new LineInfo();
    li.setLineNo(0);
    assert.strictEqual(li.getLineNo(), 0);
  });

  test('should return this for method chaining', () => {
    const li = new LineInfo();
    const result = li.setLineNo(3);
    assert.strictEqual(result, li);
  });
});

suite('LineInfo - Method - setBeforeLineNo / getBeforeLineNo', () => {
  test('should start with DEFAULT_VALUE', () => {
    const li = new LineInfo();
    assert.strictEqual(li.getBeforeLineNo(), LineInfo.DEFAULT_VALUE);
  });

  test('should set and get before line number', () => {
    const li = new LineInfo();
    li.setBeforeLineNo(2);
    assert.strictEqual(li.getBeforeLineNo(), 2);
  });

  test('should return this for method chaining', () => {
    const li = new LineInfo();
    const result = li.setBeforeLineNo(1);
    assert.strictEqual(result, li);
  });
});

suite('LineInfo - Method - setNextLineNo / getNextLineNo', () => {
  test('should start with DEFAULT_VALUE', () => {
    const li = new LineInfo();
    assert.strictEqual(li.getNextLineNo(), LineInfo.DEFAULT_VALUE);
  });

  test('should set and get next line number', () => {
    const li = new LineInfo();
    li.setNextLineNo(4);
    assert.strictEqual(li.getNextLineNo(), 4);
  });

  test('should return this for method chaining', () => {
    const li = new LineInfo();
    const result = li.setNextLineNo(7);
    assert.strictEqual(result, li);
  });
});

suite('LineInfo - Method chaining', () => {
  test('should support full method chain', () => {
    const li = new LineInfo();
    const result = li
      .setTextOrg('processA \\in dataX \\out dataY')
      .setLevel(1)
      .setLineNo(10)
      .setBeforeLineNo(9)
      .setNextLineNo(11)
      .setTextLessTypeIO('processA');
    assert.strictEqual(result, li);
    assert.strictEqual(li.getLevel(), 1);
    assert.strictEqual(li.getLineNo(), 10);
    assert.strictEqual(li.getBeforeLineNo(), 9);
    assert.strictEqual(li.getNextLineNo(), 11);
    assert.strictEqual(li.getTextLessTypeIO(), 'processA');
  });
});

suite('createCommonDataInfo - Function', () => {
  test('should create a LineInfo with DATA type', () => {
    const li = createCommonDataInfo('myData', 0);
    const expectedFormat = LineTypeDefine.get_format_by_type(LineTypeEnum.DATA);
    assert.strictEqual(li.getType().type_value, expectedFormat.type_value);
    assert.strictEqual(li.getType().type_format, '\\data');
  });

  test('should set the textLessTypeIO to the data name', () => {
    const li = createCommonDataInfo('myData', 0);
    assert.strictEqual(li.getTextLessTypeIO(), 'myData');
  });

  test('should set the level correctly', () => {
    const li = createCommonDataInfo('someData', 2);
    assert.strictEqual(li.getLevel(), 2);
  });

  test('should set level 0 at minimum', () => {
    const li = createCommonDataInfo('dataMin', 0);
    assert.strictEqual(li.getLevel(), 0);
  });

  test('should create independent instances for different names', () => {
    const li1 = createCommonDataInfo('dataA', 0);
    const li2 = createCommonDataInfo('dataB', 1);
    assert.strictEqual(li1.getTextLessTypeIO(), 'dataA');
    assert.strictEqual(li2.getTextLessTypeIO(), 'dataB');
    assert.strictEqual(li1.getLevel(), 0);
    assert.strictEqual(li2.getLevel(), 1);
  });
});
