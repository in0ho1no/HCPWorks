import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { isHcpDocument } from '../../utils/hcp_document';

/** 判定に必要な項目だけを持つドキュメントのスタブを作る */
function makeDocument(fileName: string, languageId: string): vscode.TextDocument {
  return { fileName, languageId } as unknown as vscode.TextDocument;
}

suite('hcp_document - Function - isHcpDocument', () => {
  test('should accept a .hcp file even when the language is not associated yet', () => {
    const document = makeDocument(path.join(path.sep, 'work', 'sample.hcp'), 'plaintext');

    assert.strictEqual(isHcpDocument(document), true);
  });

  test('should accept a document whose language is hcp regardless of its extension', () => {
    const document = makeDocument(path.join(path.sep, 'work', 'sample.txt'), 'hcp');

    assert.strictEqual(isHcpDocument(document), true);
  });

  test('should ignore the case of the extension', () => {
    const document = makeDocument(path.join(path.sep, 'work', 'SAMPLE.HCP'), 'plaintext');

    assert.strictEqual(isHcpDocument(document), true);
  });

  test('should accept a .hcp file under a directory whose name contains a dot', () => {
    const document = makeDocument(path.join(path.sep, 'work', 'my.project', 'sample.hcp'), 'plaintext');

    assert.strictEqual(isHcpDocument(document), true);
  });

  test('should reject a file that only contains .hcp in the middle of its name', () => {
    const document = makeDocument(path.join(path.sep, 'work', 'sample.hcp.bak'), 'plaintext');

    assert.strictEqual(isHcpDocument(document), false);
  });

  test('should reject an unrelated file', () => {
    const document = makeDocument(path.join(path.sep, 'work', 'sample.txt'), 'plaintext');

    assert.strictEqual(isHcpDocument(document), false);
  });
});
