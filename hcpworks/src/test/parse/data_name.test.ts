import * as assert from 'assert';
import { normalizeDataName } from '../../parse/data_name';

suite('normalizeDataName - Function', () => {
  test('should return empty string for empty input', () => {
    assert.strictEqual(normalizeDataName(''), '');
  });

  test('should trim surrounding spaces', () => {
    assert.strictEqual(normalizeDataName('  dataA  '), 'dataA');
  });

  test('should remove ins tags', () => {
    assert.strictEqual(normalizeDataName('<ins>カウンタ</ins>'), 'カウンタ');
  });

  test('should remove del tags', () => {
    assert.strictEqual(normalizeDataName('<del>旧名</del>'), '旧名');
  });

  test('should keep plain text unchanged except trim', () => {
    assert.strictEqual(normalizeDataName('plainData'), 'plainData');
  });
});
