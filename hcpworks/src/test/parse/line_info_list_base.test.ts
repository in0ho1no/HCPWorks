import * as assert from 'assert';
import { BaseLineProcessor } from '../../parse/line_info_list_base';
import { LineInfo } from '../../parse/line_info';
import { LineLevel } from '../../parse/line_level';

// テスト用の具体クラス（抽象クラスのテスト用実装）
class ConcreteLineProcessor extends BaseLineProcessor {
  public override createInfoList(lineInfoList: LineInfo[]): ConcreteLineProcessor {
    super.setLineInfoList(lineInfoList);
    return this;
  }
  public override limitLevelInfoList(limitLevel: number): ConcreteLineProcessor {
    return this;
  }
}

function makeLineInfo(text: string): LineInfo {
  const li = new LineInfo();
  li.setTextOrg(text);
  li.updateLevel();
  li.updateType();
  li.updateLineIO();
  return li;
}

function makeLineInfoWithText(text: string, level: number, textLessTypeIO: string): LineInfo {
  const li = new LineInfo();
  li.setTextOrg(text);
  li.setLevel(level);
  li.updateType();
  li.setTextLessTypeIO(textLessTypeIO);
  return li;
}

suite('BaseLineProcessor - Method - setLineInfoList / getLineInfoList', () => {
  test('should set and get the line info list', () => {
    const processor = new ConcreteLineProcessor();
    const li1 = makeLineInfo('processA');
    const li2 = makeLineInfo('    processB');
    const list = [li1, li2];
    processor.setLineInfoList(list);
    assert.strictEqual(processor.getLineInfoList(), list);
    assert.strictEqual(processor.getLineInfoList().length, 2);
  });

  test('should initialize with empty list', () => {
    const processor = new ConcreteLineProcessor();
    assert.deepStrictEqual(processor.getLineInfoList(), []);
  });

  test('should return this for method chaining', () => {
    const processor = new ConcreteLineProcessor();
    const result = processor.setLineInfoList([]);
    assert.strictEqual(result, processor);
  });
});

suite('BaseLineProcessor - Method - setInfoListNo', () => {
  test('should set line numbers starting from 0', () => {
    const processor = new ConcreteLineProcessor();
    const li0 = makeLineInfo('step0');
    const li1 = makeLineInfo('step1');
    const li2 = makeLineInfo('step2');
    processor.setLineInfoList([li0, li1, li2]);
    processor.setInfoListNo();
    assert.strictEqual(li0.getLineNo(), 0);
    assert.strictEqual(li1.getLineNo(), 1);
    assert.strictEqual(li2.getLineNo(), 2);
  });

  test('should set single element to index 0', () => {
    const processor = new ConcreteLineProcessor();
    const li = makeLineInfo('onlyLine');
    processor.setLineInfoList([li]);
    processor.setInfoListNo();
    assert.strictEqual(li.getLineNo(), 0);
  });

  test('should handle empty list without error', () => {
    const processor = new ConcreteLineProcessor();
    processor.setLineInfoList([]);
    assert.doesNotThrow(() => processor.setInfoListNo());
  });

  test('should return this for method chaining', () => {
    const processor = new ConcreteLineProcessor();
    processor.setLineInfoList([]);
    const result = processor.setInfoListNo();
    assert.strictEqual(result, processor);
  });
});

suite('BaseLineProcessor - Method - assignLineRelationships', () => {
  test('should connect three same-level lines in sequence', () => {
    const processor = new ConcreteLineProcessor();
    const li0 = makeLineInfo('step0');
    const li1 = makeLineInfo('step1');
    const li2 = makeLineInfo('step2');
    processor.setLineInfoList([li0, li1, li2]);
    processor.setInfoListNo();
    processor.assignLineRelationships();

    // li0: no before, next = 1
    assert.strictEqual(li0.getBeforeLineNo(), LineInfo.DEFAULT_VALUE);
    assert.strictEqual(li0.getNextLineNo(), 1);

    // li1: before = 0, next = 2
    assert.strictEqual(li1.getBeforeLineNo(), 0);
    assert.strictEqual(li1.getNextLineNo(), 2);

    // li2: before = 1, no next
    assert.strictEqual(li2.getBeforeLineNo(), 1);
    assert.strictEqual(li2.getNextLineNo(), LineInfo.DEFAULT_VALUE);
  });

  test('should connect same-level lines skipping higher-level lines between them', () => {
    // level: 0, 1, 0  - li0 and li2 should be linked even with li1 between them
    const processor = new ConcreteLineProcessor();
    const li0 = makeLineInfoWithText('step0', 0, 'step0');
    const li1 = makeLineInfoWithText('    substep1', 1, 'substep1');
    const li2 = makeLineInfoWithText('step2', 0, 'step2');
    processor.setLineInfoList([li0, li1, li2]);
    processor.setInfoListNo();
    processor.assignLineRelationships();

    // li0 (level 0): no before, next = 2 (li2, same level)
    assert.strictEqual(li0.getBeforeLineNo(), LineInfo.DEFAULT_VALUE);
    assert.strictEqual(li0.getNextLineNo(), 2);

    // li1 (level 1): no before at same level, no next
    assert.strictEqual(li1.getBeforeLineNo(), LineInfo.DEFAULT_VALUE);
    assert.strictEqual(li1.getNextLineNo(), LineInfo.DEFAULT_VALUE);

    // li2 (level 0): before = 0
    assert.strictEqual(li2.getBeforeLineNo(), 0);
  });

  test('should not link lines across a lower-level boundary', () => {
    // level: 0, 1, 0, 1  - the two level-1 lines should NOT be linked (level-0 between them)
    const processor = new ConcreteLineProcessor();
    const li0 = makeLineInfoWithText('parent1', 0, 'parent1');
    const li1 = makeLineInfoWithText('    child1', 1, 'child1');
    const li2 = makeLineInfoWithText('parent2', 0, 'parent2');
    const li3 = makeLineInfoWithText('    child2', 1, 'child2');
    processor.setLineInfoList([li0, li1, li2, li3]);
    processor.setInfoListNo();
    processor.assignLineRelationships();

    // li1 (level 1): has no before at same level
    assert.strictEqual(li1.getBeforeLineNo(), LineInfo.DEFAULT_VALUE);
    assert.strictEqual(li1.getNextLineNo(), LineInfo.DEFAULT_VALUE);

    // li3 (level 1): also no before because li2 (level 0 < level 1) breaks the chain
    assert.strictEqual(li3.getBeforeLineNo(), LineInfo.DEFAULT_VALUE);
  });

  test('should handle mixed levels connecting correctly', () => {
    // level: 0, 1, 1, 0  - the two level-1 lines should be linked
    const processor = new ConcreteLineProcessor();
    const li0 = makeLineInfoWithText('parent1', 0, 'parent1');
    const li1 = makeLineInfoWithText('    childA', 1, 'childA');
    const li2 = makeLineInfoWithText('    childB', 1, 'childB');
    const li3 = makeLineInfoWithText('parent2', 0, 'parent2');
    processor.setLineInfoList([li0, li1, li2, li3]);
    processor.setInfoListNo();
    processor.assignLineRelationships();

    // li1 and li2 same level: li1.next = 2, li2.before = 1
    assert.strictEqual(li1.getNextLineNo(), 2);
    assert.strictEqual(li2.getBeforeLineNo(), 1);

    // li0 and li3 same level: li0.next = 3, li3.before = 0
    assert.strictEqual(li0.getNextLineNo(), 3);
    assert.strictEqual(li3.getBeforeLineNo(), 0);
  });

  test('should return this for method chaining', () => {
    const processor = new ConcreteLineProcessor();
    processor.setLineInfoList([]);
    const result = processor.assignLineRelationships();
    assert.strictEqual(result, processor);
  });
});

suite('BaseLineProcessor - Method - removeDuplicate', () => {
  test('should remove lines with duplicate textLessTypeIO', () => {
    const processor = new ConcreteLineProcessor();
    const li0 = makeLineInfoWithText('step0', 0, 'duplicate');
    const li1 = makeLineInfoWithText('step1', 0, 'unique');
    const li2 = makeLineInfoWithText('step2', 0, 'duplicate');
    processor.setLineInfoList([li0, li1, li2]);
    processor.removeDuplicate();
    const result = processor.getLineInfoList();
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].getTextLessTypeIO(), 'duplicate');
    assert.strictEqual(result[1].getTextLessTypeIO(), 'unique');
  });

  test('should keep first occurrence when duplicates exist', () => {
    const processor = new ConcreteLineProcessor();
    const li0 = makeLineInfoWithText('step0', 0, 'data');
    const li1 = makeLineInfoWithText('step1', 1, 'data');
    processor.setLineInfoList([li0, li1]);
    processor.removeDuplicate();
    const result = processor.getLineInfoList();
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0], li0);
  });

  test('should not remove unique lines', () => {
    const processor = new ConcreteLineProcessor();
    const li0 = makeLineInfoWithText('step0', 0, 'alpha');
    const li1 = makeLineInfoWithText('step1', 0, 'beta');
    const li2 = makeLineInfoWithText('step2', 0, 'gamma');
    processor.setLineInfoList([li0, li1, li2]);
    processor.removeDuplicate();
    assert.strictEqual(processor.getLineInfoList().length, 3);
  });

  test('should handle empty list', () => {
    const processor = new ConcreteLineProcessor();
    processor.setLineInfoList([]);
    processor.removeDuplicate();
    assert.deepStrictEqual(processor.getLineInfoList(), []);
  });

  test('should return this for method chaining', () => {
    const processor = new ConcreteLineProcessor();
    processor.setLineInfoList([]);
    const result = processor.removeDuplicate();
    assert.strictEqual(result, processor);
  });
});

suite('BaseLineProcessor - Method - setMinLevel / getMinLevel', () => {
  test('should set min level from list with single level', () => {
    const processor = new ConcreteLineProcessor();
    const li0 = makeLineInfoWithText('step0', 2, 'step0');
    const li1 = makeLineInfoWithText('step1', 2, 'step1');
    processor.setLineInfoList([li0, li1]);
    processor.setMinLevel();
    assert.strictEqual(processor.getMinLevel(), 2);
  });

  test('should find minimum among mixed levels', () => {
    const processor = new ConcreteLineProcessor();
    const li0 = makeLineInfoWithText('step0', 3, 'step0');
    const li1 = makeLineInfoWithText('step1', 1, 'step1');
    const li2 = makeLineInfoWithText('step2', 2, 'step2');
    processor.setLineInfoList([li0, li1, li2]);
    processor.setMinLevel();
    assert.strictEqual(processor.getMinLevel(), 1);
  });

  test('should return LEVEL_MAX for empty list', () => {
    const processor = new ConcreteLineProcessor();
    processor.setLineInfoList([]);
    processor.setMinLevel();
    assert.strictEqual(processor.getMinLevel(), LineLevel.LEVEL_MAX);
  });

  test('should default minLevel to 0', () => {
    const processor = new ConcreteLineProcessor();
    assert.strictEqual(processor.getMinLevel(), 0);
  });

  test('should return this for method chaining', () => {
    const processor = new ConcreteLineProcessor();
    processor.setLineInfoList([]);
    const result = processor.setMinLevel();
    assert.strictEqual(result, processor);
  });
});
