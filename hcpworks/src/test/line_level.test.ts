import * as assert from 'assert';
import { LineLevel } from '../line_level';

suite('line_level - Class', () => {
  test('constructor should initialize value to LEVEL_MIN', () => {
    const lineLevel = new LineLevel();
    // @ts-ignore: privateプロパティにアクセスするため
    assert.strictEqual(lineLevel._level, LineLevel.LEVEL_MIN);
  });

  suite('line_level - Method - createIndentPattern', () => {
    test('should create correct pattern for tab count 0', () => {
      const pattern = LineLevel.createIndentPattern(0);
      assert.strictEqual(pattern, '^(?:[ ]{0}|\\t{0})\\S.*$');

      // パターンが正しく動作するか検証
      const regex = new RegExp(pattern);
      assert.strictEqual(regex.test('abc'), true); // インデントなしの行
      assert.strictEqual(regex.test(' abc'), false); // スペース1つの行
      assert.strictEqual(regex.test('\tabc'), false); // タブ1つの行
    });

    test('should create correct pattern for tab count 1', () => {
      const pattern = LineLevel.createIndentPattern(1);
      assert.strictEqual(pattern, '^(?:[ ]{4}|\\t{1})\\S.*$');

      // パターンが正しく動作するか検証
      const regex = new RegExp(pattern);
      assert.strictEqual(regex.test('abc'), false); // インデントなしの行
      assert.strictEqual(regex.test('    abc'), true); // スペース4つの行
      assert.strictEqual(regex.test('\tabc'), true); // タブ1つの行
      assert.strictEqual(regex.test('  abc'), false); // スペース2つの行
    });

    test('should create correct pattern for tab count 2', () => {
      const pattern = LineLevel.createIndentPattern(2);
      assert.strictEqual(pattern, '^(?:[ ]{8}|\\t{2})\\S.*$');

      // パターンが正しく動作するか検証
      const regex = new RegExp(pattern);
      assert.strictEqual(regex.test('        abc'), true); // スペース8つの行
      assert.strictEqual(regex.test('\t\tabc'), true); // タブ2つの行
      assert.strictEqual(regex.test('    abc'), false); // スペース4つの行
    });

    test('should throw error for negative tab count', () => {
      assert.throws(() => {
        LineLevel.createIndentPattern(-1);
      }, /tabCount must be non-negative/);
    });
  });

  suite('line_level - Method - getLineLevel', () => {
    test('should return LEVEL_NONE for empty lines', () => {
      assert.strictEqual(LineLevel.getLineLevel(''), LineLevel.LEVEL_NONE);
      assert.strictEqual(LineLevel.getLineLevel('  '), LineLevel.LEVEL_NONE);
      assert.strictEqual(LineLevel.getLineLevel('\t'), LineLevel.LEVEL_NONE);
    });

    test('should return correct level for indented lines', () => {
      // レベル0
      assert.strictEqual(LineLevel.getLineLevel('abc'), 0);

      // レベル1
      assert.strictEqual(LineLevel.getLineLevel('    abc'), 1);
      assert.strictEqual(LineLevel.getLineLevel('\tabc'), 1);

      // レベル2
      assert.strictEqual(LineLevel.getLineLevel('        abc'), 2);
      assert.strictEqual(LineLevel.getLineLevel('\t\tabc'), 2);

      // レベル3
      assert.strictEqual(LineLevel.getLineLevel('            abc'), 3);
      assert.strictEqual(LineLevel.getLineLevel('\t\t\tabc'), 3);
    });

    test('should throw error for invalid indent patterns', () => {
      assert.throws(() => {
        // 混合インデント（タブとスペース）は不正
        LineLevel.getLineLevel('\t  abc');
      }, /Wrong indent pattern/);

      assert.throws(() => {
        // スペース数が4の倍数でない場合は不正
        LineLevel.getLineLevel('   abc'); // スペース3つ
      }, /Wrong indent pattern/);

      // 行が長すぎる場合（レベル超過）
      const longIndent = ' '.repeat(LineLevel.LEVEL_MAX * LineLevel.TAB2SPACE) + 'abc';
      assert.throws(() => {
        LineLevel.getLineLevel(longIndent);
      }, /Wrong indent pattern/);
    });
  });
});