import * as assert from 'assert';
import * as vscode from 'vscode';
import { HCPFoldingRangeProvider } from '../../provider/folding_provider';

function makeDocument(lines: string[]): vscode.TextDocument {
  return {
    lineCount: lines.length,
    lineAt: (index: number) => ({ text: lines[index] }),
  } as unknown as vscode.TextDocument;
}

const provider = new HCPFoldingRangeProvider();
const dummyContext = {} as vscode.FoldingContext;
const dummyToken = {} as vscode.CancellationToken;

suite('HCPFoldingRangeProvider', () => {
  test('\\module が1つだけの場合、ファイル末尾までの範囲を返す', () => {
    const doc = makeDocument([
      '\\module ModA',
      '  処理1',
      '  処理2',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    assert.strictEqual(ranges.length, 1);
    assert.strictEqual(ranges[0].start, 0);
    assert.strictEqual(ranges[0].end, 2);
  });

  test('\\module が複数ある場合、それぞれの範囲を返す', () => {
    const doc = makeDocument([
      '\\module ModA',
      '  処理A1',
      '  処理A2',
      '\\module ModB',
      '  処理B1',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    assert.strictEqual(ranges.length, 2);
    assert.strictEqual(ranges[0].start, 0);
    assert.strictEqual(ranges[0].end, 2);
    assert.strictEqual(ranges[1].start, 3);
    assert.strictEqual(ranges[1].end, 4);
  });

  test('\\module 間の末尾空行は折り畳み範囲から除外される', () => {
    const doc = makeDocument([
      '\\module ModA',
      '  処理A1',
      '',
      '\\module ModB',
      '  処理B1',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    assert.strictEqual(ranges.length, 2);
    assert.strictEqual(ranges[0].start, 0);
    assert.strictEqual(ranges[0].end, 1);
  });

  test('ファイル末尾の空行は折り畳み範囲から除外される', () => {
    const doc = makeDocument([
      '\\module ModA',
      '  処理1',
      '',
      '',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    assert.strictEqual(ranges.length, 1);
    assert.strictEqual(ranges[0].start, 0);
    assert.strictEqual(ranges[0].end, 1);
  });

  test('\\module が存在しない場合、空配列を返す', () => {
    const doc = makeDocument([
      '  処理1',
      '  処理2',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    assert.strictEqual(ranges.length, 0);
  });

  test('\\module の1行のみ（本文なし）の場合、範囲を生成しない', () => {
    const doc = makeDocument([
      '\\module ModA',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    assert.strictEqual(ranges.length, 0);
  });

  test('FoldingRangeKind.Region が設定される', () => {
    const doc = makeDocument([
      '\\module ModA',
      '  処理1',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    assert.strictEqual(ranges[0].kind, vscode.FoldingRangeKind.Region);
  });
});
