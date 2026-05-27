import * as assert from 'assert';
import { ProcessLineProcessor } from '../../parse/line_info_list_process';
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

function makeProcessLineInfo(text: string, level: number): LineInfo {
  const li = new LineInfo();
  li.setTextOrg(text);
  li.setLevel(level);
  li.updateType();
  li.setTextLessTypeIO(text.trim());
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

suite('ProcessLineProcessor - Method - createInfoList', () => {
  test('should exclude DATA type lines', () => {
    const li0 = makeLineInfo('processA');
    const li1 = makeLineInfo('\\data dataX');
    const li2 = makeLineInfo('\\fork condition');

    const processor = new ProcessLineProcessor();
    processor.createInfoList([li0, li1, li2]);

    const result = processor.getLineInfoList();
    const dataTypeValue = LineTypeDefine.get_format_by_type(LineTypeEnum.DATA).type_value;
    result.forEach(line => {
      assert.notStrictEqual(line.getType().type_value, dataTypeValue);
    });
    assert.strictEqual(result.length, 2);
  });

  test('should keep NORMAL type lines', () => {
    const li0 = makeLineInfo('normalProcess');
    const processor = new ProcessLineProcessor();
    processor.createInfoList([li0]);
    assert.strictEqual(processor.getLineInfoList().length, 1);
  });

  test('should keep FORK type lines', () => {
    const li0 = makeLineInfo('\\fork condition');
    const processor = new ProcessLineProcessor();
    processor.createInfoList([li0]);
    assert.strictEqual(processor.getLineInfoList().length, 1);
    assert.strictEqual(processor.getLineInfoList()[0].getType().type_format, '\\fork');
  });

  test('should keep REPEAT, MOD, RETURN, TRUE, FALSE, BRANCH, MODULE type lines', () => {
    const lines = [
      makeLineInfo('\\repeat loop'),
      makeLineInfo('\\mod modification'),
      makeLineInfo('\\return value'),
      makeLineInfo('\\true trueCase'),
      makeLineInfo('\\false falseCase'),
      makeLineInfo('\\branch branchName'),
      makeLineInfo('\\module modName'),
    ];
    const processor = new ProcessLineProcessor();
    processor.createInfoList(lines);
    assert.strictEqual(processor.getLineInfoList().length, lines.length);
  });

  test('should return empty list when all lines are DATA type', () => {
    const li0 = makeLineInfo('\\data dataA');
    const li1 = makeLineInfo('\\data dataB');

    const processor = new ProcessLineProcessor();
    processor.createInfoList([li0, li1]);

    assert.strictEqual(processor.getLineInfoList().length, 0);
  });

  test('should handle empty input list', () => {
    const processor = new ProcessLineProcessor();
    processor.createInfoList([]);
    assert.deepStrictEqual(processor.getLineInfoList(), []);
  });

  test('should return this for method chaining', () => {
    const processor = new ProcessLineProcessor();
    const result = processor.createInfoList([]);
    assert.strictEqual(result, processor);
  });
});

suite('ProcessLineProcessor - Method - limitLevelInfoList', () => {
  test('should keep only lines at or below limitLevel', () => {
    const li0 = makeProcessLineInfo('step0', 0);
    const li1 = makeProcessLineInfo('    step1', 1);
    const li2 = makeProcessLineInfo('        step2', 2);

    const processor = new ProcessLineProcessor();
    processor.setLineInfoList([li0, li1, li2]);
    processor.limitLevelInfoList(1);

    const result = processor.getLineInfoList();
    assert.strictEqual(result.length, 2);
    result.forEach(line => {
      assert.ok(line.getLevel() <= 1);
    });
  });

  test('should keep all lines when limitLevel equals max level in list', () => {
    const li0 = makeProcessLineInfo('step0', 0);
    const li1 = makeProcessLineInfo('    step1', 1);
    const li2 = makeProcessLineInfo('        step2', 2);

    const processor = new ProcessLineProcessor();
    processor.setLineInfoList([li0, li1, li2]);
    processor.limitLevelInfoList(2);

    assert.strictEqual(processor.getLineInfoList().length, 3);
  });

  test('should keep only level 0 lines when limitLevel is 0', () => {
    const li0 = makeProcessLineInfo('step0', 0);
    const li1 = makeProcessLineInfo('    step1', 1);
    const li2 = makeProcessLineInfo('step2', 0);

    const processor = new ProcessLineProcessor();
    processor.setLineInfoList([li0, li1, li2]);
    processor.limitLevelInfoList(0);

    const result = processor.getLineInfoList();
    assert.strictEqual(result.length, 2);
    result.forEach(line => {
      assert.strictEqual(line.getLevel(), 0);
    });
  });

  test('should return empty list when all lines exceed limitLevel', () => {
    const li0 = makeProcessLineInfo('    step0', 1);
    const li1 = makeProcessLineInfo('        step1', 2);

    const processor = new ProcessLineProcessor();
    processor.setLineInfoList([li0, li1]);
    processor.limitLevelInfoList(0);

    assert.strictEqual(processor.getLineInfoList().length, 0);
  });

  test('should handle empty list', () => {
    const processor = new ProcessLineProcessor();
    processor.setLineInfoList([]);
    processor.limitLevelInfoList(1);
    assert.deepStrictEqual(processor.getLineInfoList(), []);
  });

  test('should return this for method chaining', () => {
    const processor = new ProcessLineProcessor();
    processor.setLineInfoList([]);
    const result = processor.limitLevelInfoList(0);
    assert.strictEqual(result, processor);
  });
});

suite('ProcessLineProcessor - Method - process (static)', () => {
  test('should exclude DATA lines from the result', () => {
    const li0 = makeLineInfo('processA');
    const li1 = makeLineInfo('\\data dataX');
    const li2 = makeLineInfo('\\fork condition');

    const result = ProcessLineProcessor.process([li0, li1, li2], 10);

    const dataTypeValue = LineTypeDefine.get_format_by_type(LineTypeEnum.DATA).type_value;
    result.getLineInfoList().forEach(line => {
      assert.notStrictEqual(line.getType().type_value, dataTypeValue);
    });
    assert.strictEqual(result.getLineInfoList().length, 2);
  });

  test('should apply level limit', () => {
    const li0 = makeLineInfo('processA');
    const li1 = makeLineInfo('    childB');
    const li2 = makeLineInfo('        grandchildC');

    const result = ProcessLineProcessor.process([li0, li1, li2], 1);

    assert.strictEqual(result.getLineInfoList().length, 2);
    result.getLineInfoList().forEach(line => {
      assert.ok(line.getLevel() <= 1);
    });
  });

  test('should assign sequential line numbers', () => {
    const li0 = makeLineInfo('step0');
    const li1 = makeLineInfo('step1');
    const li2 = makeLineInfo('step2');

    const result = ProcessLineProcessor.process([li0, li1, li2], 10);

    const lines = result.getLineInfoList();
    assert.strictEqual(lines[0].getLineNo(), 0);
    assert.strictEqual(lines[1].getLineNo(), 1);
    assert.strictEqual(lines[2].getLineNo(), 2);
  });

  test('should set minimum level', () => {
    const li0 = makeProcessLineInfo('step0', 2);
    const li1 = makeProcessLineInfo('step1', 1);
    const li2 = makeProcessLineInfo('step2', 3);

    const result = ProcessLineProcessor.process([li0, li1, li2], 10);

    assert.strictEqual(result.getMinLevel(), 1);
  });

  test('should assign line relationships', () => {
    const li0 = makeLineInfo('step0');
    const li1 = makeLineInfo('step1');
    const li2 = makeLineInfo('step2');

    const result = ProcessLineProcessor.process([li0, li1, li2], 10);
    const lines = result.getLineInfoList();

    assert.strictEqual(lines[0].getNextLineNo(), 1);
    assert.strictEqual(lines[1].getBeforeLineNo(), 0);
    assert.strictEqual(lines[1].getNextLineNo(), 2);
    assert.strictEqual(lines[2].getBeforeLineNo(), 1);
  });

  test('should handle empty list', () => {
    const result = ProcessLineProcessor.process([], 0);
    assert.deepStrictEqual(result.getLineInfoList(), []);
  });

  test('should return a ProcessLineProcessor instance', () => {
    const result = ProcessLineProcessor.process([], 0);
    assert.ok(result instanceof ProcessLineProcessor);
  });

  test('should combine DATA exclusion and level limit', () => {
    const li0 = makeLineInfo('step0');
    const li1 = makeLineInfo('    step1');
    const li2 = makeLineInfo('\\data dataX');
    const li3 = makeLineInfo('        step2');

    const result = ProcessLineProcessor.process([li0, li1, li2, li3], 1);

    // DATA excluded, level > 1 excluded
    assert.strictEqual(result.getLineInfoList().length, 2);
    const dataTypeValue = LineTypeDefine.get_format_by_type(LineTypeEnum.DATA).type_value;
    result.getLineInfoList().forEach(line => {
      assert.notStrictEqual(line.getType().type_value, dataTypeValue);
      assert.ok(line.getLevel() <= 1);
    });
  });
});
