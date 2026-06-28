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

// --- \module folding ---

suite('HCPFoldingRangeProvider - \\module', () => {
  test('\\module が1つだけの場合、ファイル末尾までの範囲を返す', () => {
    const doc = makeDocument([
      '\\module ModA',
      '  処理1',
      '  処理2',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    const mod = ranges.find(r => r.start === 0);
    assert.ok(mod, '\\module の範囲が存在すること');
    assert.strictEqual(mod!.end, 2);
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
    const mods = ranges.filter(r => r.start === 0 || r.start === 3);
    assert.strictEqual(mods.length, 2);
    assert.strictEqual(mods.find(r => r.start === 0)!.end, 2);
    assert.strictEqual(mods.find(r => r.start === 3)!.end, 4);
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
    const modA = ranges.find(r => r.start === 0);
    assert.ok(modA);
    assert.strictEqual(modA!.end, 1);
  });

  test('ファイル末尾の空行は折り畳み範囲から除外される', () => {
    const doc = makeDocument([
      '\\module ModA',
      '  処理1',
      '',
      '',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    const mod = ranges.find(r => r.start === 0);
    assert.ok(mod);
    assert.strictEqual(mod!.end, 1);
  });

  test('\\module が存在しない場合、module の範囲は返さない', () => {
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

// --- \table folding ---

suite('HCPFoldingRangeProvider - \\table', () => {
  test('\\table がファイル末尾まで続く場合、その範囲を返す', () => {
    const doc = makeDocument([
      '\\table Caption',
      '  col1, col2',
      '  val1, val2',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    assert.strictEqual(ranges.length, 1);
    assert.strictEqual(ranges[0].start, 0);
    assert.strictEqual(ranges[0].end, 2);
  });

  test('\\table が空行で終端される', () => {
    const doc = makeDocument([
      '\\table Caption',
      '  col1, col2',
      '',
      '  処理1',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    const tbl = ranges.find(r => r.start === 0);
    assert.ok(tbl, '\\table の範囲が存在すること');
    assert.strictEqual(tbl!.end, 1);
  });

  test('\\table が \\data で終端される', () => {
    const doc = makeDocument([
      '\\table Caption',
      '  col1, col2',
      '\\data x',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    const tbl = ranges.find(r => r.start === 0);
    assert.ok(tbl);
    assert.strictEqual(tbl!.end, 1);
  });

  test('\\table が次の \\table で終端される', () => {
    const doc = makeDocument([
      '\\table Caption1',
      '  col1, col2',
      '\\table Caption2',
      '  col3, col4',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    const tbl1 = ranges.find(r => r.start === 0);
    const tbl2 = ranges.find(r => r.start === 2);
    assert.ok(tbl1);
    assert.strictEqual(tbl1!.end, 1);
    assert.ok(tbl2);
    assert.strictEqual(tbl2!.end, 3);
  });

  test('\\table が次の \\module で終端される', () => {
    const doc = makeDocument([
      '\\module ModA',
      '\\table Caption',
      '  col1, col2',
      '\\module ModB',
      '  処理B1',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    const tbl = ranges.find(r => r.start === 1);
    assert.ok(tbl);
    assert.strictEqual(tbl!.end, 2);
  });

  test('\\table の内容が1行もない場合、範囲を生成しない', () => {
    const doc = makeDocument([
      '\\table Caption',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    assert.strictEqual(ranges.length, 0);
  });

  test('\\module と \\table が共存する場合、両方の範囲を返す', () => {
    const doc = makeDocument([
      '\\module ModA',
      '  \\table Caption',
      '    col1, col2',
      '',
      '  処理1',
    ]);
    const ranges = provider.provideFoldingRanges(doc, dummyContext, dummyToken);
    const mod = ranges.find(r => r.start === 0);
    const tbl = ranges.find(r => r.start === 1);
    assert.ok(mod, '\\module の範囲が存在すること');
    assert.ok(tbl, '\\table の範囲が存在すること');
    assert.strictEqual(tbl!.end, 2);
  });
});
