import * as assert from 'assert';
import { DataLineProcessor } from '../../parse/line_info_list_data';
import { LineInfo } from '../../parse/line_info';
import { LineTypeEnum, LineTypeDefine } from '../../parse/line_define';

function makeLineInfo(text: string): LineInfo {
  const li = new LineInfo();
  li.setTextOrg(text);
  li.updateLevel();
  li.updateType();
  li.updateLineIO();
  return li;
}

function makeDataLineInfo(name: string, level: number): LineInfo {
  const li = new LineInfo();
  li.setTextOrg('\\data ' + name);
  li.setLevel(level);
  li.updateType();
  li.setTextLessTypeIO(name);
  return li;
}

function makeProcessLineInfo(text: string, level: number): LineInfo {
  const li = new LineInfo();
  li.setTextOrg(text);
  li.setLevel(level);
  li.updateType();
  li.setTextLessTypeIO(text.trim());
  return li;
}

suite('DataLineProcessor - Method - createInfoList', () => {
  test('should extract only DATA type lines', () => {
    const li0 = makeLineInfo('processA');
    const li1 = makeLineInfo('\\data dataX');
    const li2 = makeLineInfo('\\fork condition');
    const li3 = makeLineInfo('\\data dataY');

    const processor = new DataLineProcessor();
    processor.createInfoList([li0, li1, li2, li3]);

    const result = processor.getLineInfoList();
    assert.strictEqual(result.length, 2);
    const dataTypeValue = LineTypeDefine.get_format_by_type(LineTypeEnum.DATA).type_value;
    assert.strictEqual(result[0].getType().type_value, dataTypeValue);
    assert.strictEqual(result[1].getType().type_value, dataTypeValue);
  });

  test('should return empty list when no DATA lines exist', () => {
    const li0 = makeLineInfo('processA');
    const li1 = makeLineInfo('\\fork condition');
    const li2 = makeLineInfo('\\repeat loopCond');

    const processor = new DataLineProcessor();
    processor.createInfoList([li0, li1, li2]);

    assert.strictEqual(processor.getLineInfoList().length, 0);
  });

  test('should keep all DATA lines when all are DATA type', () => {
    const li0 = makeLineInfo('\\data dataA');
    const li1 = makeLineInfo('\\data dataB');
    const li2 = makeLineInfo('\\data dataC');

    const processor = new DataLineProcessor();
    processor.createInfoList([li0, li1, li2]);

    assert.strictEqual(processor.getLineInfoList().length, 3);
  });

  test('should handle empty input list', () => {
    const processor = new DataLineProcessor();
    processor.createInfoList([]);
    assert.deepStrictEqual(processor.getLineInfoList(), []);
  });

  test('should return this for method chaining', () => {
    const processor = new DataLineProcessor();
    const result = processor.createInfoList([]);
    assert.strictEqual(result, processor);
  });

  test('should exclude NORMAL, FORK, REPEAT, MOD, RETURN, BRANCH, MODULE type lines', () => {
    const lines = [
      makeLineInfo('normalProcess'),
      makeLineInfo('\\fork cond'),
      makeLineInfo('\\repeat loop'),
      makeLineInfo('\\mod modification'),
      makeLineInfo('\\return value'),
      makeLineInfo('\\branch branchName'),
      makeLineInfo('\\module modName'),
    ];
    const processor = new DataLineProcessor();
    processor.createInfoList(lines);
    assert.strictEqual(processor.getLineInfoList().length, 0);
  });
});

suite('DataLineProcessor - Method - limitLevelInfoList', () => {
  test('should not filter lines by level (data section ignores level limit)', () => {
    const li0 = makeDataLineInfo('dataA', 0);
    const li1 = makeDataLineInfo('dataB', 1);
    const li2 = makeDataLineInfo('dataC', 2);

    const processor = new DataLineProcessor();
    processor.setLineInfoList([li0, li1, li2]);
    processor.limitLevelInfoList(0);

    // All lines should remain even when limitLevel=0
    assert.strictEqual(processor.getLineInfoList().length, 3);
  });

  test('should not change the list regardless of limitLevel value', () => {
    const li0 = makeDataLineInfo('dataA', 5);
    const li1 = makeDataLineInfo('dataB', 10);

    const processor = new DataLineProcessor();
    processor.setLineInfoList([li0, li1]);
    processor.limitLevelInfoList(1);

    assert.strictEqual(processor.getLineInfoList().length, 2);
  });

  test('should return this for method chaining', () => {
    const processor = new DataLineProcessor();
    processor.setLineInfoList([]);
    const result = processor.limitLevelInfoList(0);
    assert.strictEqual(result, processor);
  });
});

suite('DataLineProcessor - Method - process (static)', () => {
  test('should execute full processing pipeline on data lines', () => {
    const li0 = makeLineInfo('processA');
    const li1 = makeLineInfo('\\data dataX');
    const li2 = makeLineInfo('\\fork condition');
    const li3 = makeLineInfo('\\data dataY');

    const result = DataLineProcessor.process([li0, li1, li2, li3]);

    // Only DATA lines should remain
    const dataTypeValue = LineTypeDefine.get_format_by_type(LineTypeEnum.DATA).type_value;
    const lines = result.getLineInfoList();
    assert.strictEqual(lines.length, 2);
    lines.forEach(line => {
      assert.strictEqual(line.getType().type_value, dataTypeValue);
    });
  });

  test('should assign sequential line numbers', () => {
    const li0 = makeLineInfo('\\data dataA');
    const li1 = makeLineInfo('\\data dataB');
    const li2 = makeLineInfo('\\data dataC');

    const result = DataLineProcessor.process([li0, li1, li2]);

    const lines = result.getLineInfoList();
    assert.strictEqual(lines[0].getLineNo(), 0);
    assert.strictEqual(lines[1].getLineNo(), 1);
    assert.strictEqual(lines[2].getLineNo(), 2);
  });

  test('should remove duplicate data entries', () => {
    const li0 = makeDataLineInfo('dataA', 0);
    const li1 = makeDataLineInfo('dataA', 0); // duplicate
    const li2 = makeDataLineInfo('dataB', 0);

    const result = DataLineProcessor.process([li0, li1, li2]);

    assert.strictEqual(result.getLineInfoList().length, 2);
  });

  test('should set minimum level', () => {
    const li0 = makeDataLineInfo('dataA', 2);
    const li1 = makeDataLineInfo('dataB', 1);
    const li2 = makeDataLineInfo('dataC', 3);

    const result = DataLineProcessor.process([li0, li1, li2]);

    assert.strictEqual(result.getMinLevel(), 1);
  });

  test('should assign line relationships for same-level entries', () => {
    const li0 = makeDataLineInfo('dataA', 0);
    const li1 = makeDataLineInfo('dataB', 0);
    const li2 = makeDataLineInfo('dataC', 0);

    const result = DataLineProcessor.process([li0, li1, li2]);
    const lines = result.getLineInfoList();

    // After setInfoListNo and assignLineRelationships
    assert.strictEqual(lines[0].getNextLineNo(), 1);
    assert.strictEqual(lines[1].getBeforeLineNo(), 0);
    assert.strictEqual(lines[1].getNextLineNo(), 2);
    assert.strictEqual(lines[2].getBeforeLineNo(), 1);
  });

  test('should handle empty list', () => {
    const result = DataLineProcessor.process([]);
    assert.deepStrictEqual(result.getLineInfoList(), []);
  });

  test('should return a DataLineProcessor instance', () => {
    const result = DataLineProcessor.process([]);
    assert.ok(result instanceof DataLineProcessor);
  });
});
