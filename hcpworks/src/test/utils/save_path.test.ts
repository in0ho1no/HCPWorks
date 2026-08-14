import * as assert from 'assert';
import * as path from 'path';
import { buildSavePathBase } from '../../utils/save_path';

suite('save_path - Function - buildSavePathBase', () => {
  test('should place the output next to the source file', () => {
    const filePath = path.join(path.sep, 'work', 'sample', 'sample.hcp');
    const expected = path.join(path.sep, 'work', 'sample', 'sample_myModule');

    assert.strictEqual(buildSavePathBase(filePath, 'myModule'), expected);
  });

  test('should keep the directory when a directory name contains a dot', () => {
    const filePath = path.join(path.sep, 'home', 'user', 'my.project', 'foo.hcp');
    const expected = path.join(path.sep, 'home', 'user', 'my.project', 'foo_myModule');

    assert.strictEqual(buildSavePathBase(filePath, 'myModule'), expected);
  });

  test('should keep the directory when the path contains a dot-prefixed directory', () => {
    const filePath = path.join(path.sep, 'home', 'user', '.config', 'hcp', 'foo.hcp');
    const expected = path.join(path.sep, 'home', 'user', '.config', 'hcp', 'foo_myModule');

    assert.strictEqual(buildSavePathBase(filePath, 'myModule'), expected);
  });

  test('should strip only the extension when the file name contains a dot', () => {
    const dirPath = path.join(path.sep, 'home', 'user', 'docs');
    const v1 = buildSavePathBase(path.join(dirPath, 'foo.v1.hcp'), 'myModule');
    const v2 = buildSavePathBase(path.join(dirPath, 'foo.v2.hcp'), 'myModule');

    assert.strictEqual(v1, path.join(dirPath, 'foo.v1_myModule'));
    // ドット以降が失われると v1 と v2 が同じ出力先を奪い合うため、区別されることを確認する
    assert.notStrictEqual(v1, v2);
  });
});
