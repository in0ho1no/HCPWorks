import * as assert from 'assert';
import { parseModules, cleanTextLines, extractTables, extractModuleMeta, Module, TableRow } from '../../parse/file_parse';

/** 表の行配列からセルだけを取り出す(depthを無視して比較するためのヘルパー) */
const cellsOf = (rows: TableRow[]): string[][] => rows.map(row => row.cells);

suite('file_parse - Function - parseModules', () => {
	test('Should parse a single module correctly', () => {
		const input = '\\module test\nline1\nline2\nline3';
		const expected: Module[] = [
			{
				name: 'test',
				content: ['line1', 'line2', 'line3']
			}
		];

		assert.deepStrictEqual(parseModules(input), expected);
	});

	test('Should parse multiple modules correctly', () => {
		const input = '\\module module1\nline1\nline2\n\\module module2\nline3\nline4';
		const expected: Module[] = [
			{
				name: 'module1',
				content: ['line1', 'line2']
			},
			{
				name: 'module2',
				content: ['line3', 'line4']
			}
		];

		assert.deepStrictEqual(parseModules(input), expected);
	});

	test('Should return empty array for empty file', () => {

		assert.deepStrictEqual(parseModules(''), []);
	});

	test('Should handle module definition with no content', () => {
		const input = '\\module test';
		const expected: Module[] = [
			{
				name: 'test',
				content: []
			}
		];

		assert.deepStrictEqual(parseModules(input), expected);
	});

	test('Should handle extra spaces in module name', () => {
		const input = '\\module  test  \nline1';
		const expected: Module[] = [
			{
				name: 'test',
				content: ['line1']
			}
		];

		assert.deepStrictEqual(parseModules(input), expected);
	});

	test('Should ignore lines before first module definition', () => {
		const input = 'ignore this\nignore this too\n\\module test\nline1';
		const expected: Module[] = [
			{
				name: 'test',
				content: ['line1']
			}
		];

		assert.deepStrictEqual(parseModules(input), expected);
	});

});

suite('file_parse - Function - cleanTextLines', () => {
	test('Should remove comments', () => {
		const input = ['line1 # comment', 'line2# comment', 'line3 #comment'];
		const expected = ['line1 ', 'line2', 'line3 '];

		assert.deepStrictEqual(cleanTextLines(input), expected);
	});

	test('Should ignore empty lines', () => {
		const input = ['line1', '', '   ', 'line2'];
		const expected = ['line1', 'line2'];

		assert.deepStrictEqual(cleanTextLines(input), expected);
	});

	test('Should ignore comment-only lines', () => {
		const input = ['line1', '# comment only', 'line2'];
		const expected = ['line1', 'line2'];

		assert.deepStrictEqual(cleanTextLines(input), expected);
	});

	test('Should ignore lines with only spaces and comments', () => {
		const input = ['line1', '  # comment with spaces', 'line2'];
		const expected = ['line1', 'line2'];

		assert.deepStrictEqual(cleanTextLines(input), expected);
	});

	test('Should preserve leading whitespace', () => {
		const input = ['  line1', '\tline2', ' \t line3'];
		const expected = ['  line1', '\tline2', ' \t line3'];

		assert.deepStrictEqual(cleanTextLines(input), expected);
	});

	test('Should handle multiple # characters', () => {
		const input = ['line with # comment # and more #', 'line2 ## double hash'];
		const expected = ['line with ', 'line2 '];

		assert.deepStrictEqual(cleanTextLines(input), expected);
	});

	test('Should return empty array for empty input', () => {
		assert.deepStrictEqual(cleanTextLines([]), []);
	});
});

suite('file_parse - Function - extractModuleMeta', () => {
	test('Should extract kind and scope values', () => {
		const input = [
			'\\kind 新規作成',
			'\\scope 公開関数',
			'通常行',
		];
		const { meta, remainingLines } = extractModuleMeta(input);

		assert.strictEqual(meta.kind, '新規作成');
		assert.strictEqual(meta.scope, '公開関数');
		assert.deepStrictEqual(remainingLines, ['通常行']);
	});

	test('Should default to empty strings when no meta exists', () => {
		const input = ['通常行1', '通常行2'];
		const { meta, remainingLines } = extractModuleMeta(input);

		assert.deepStrictEqual(meta, { kind: '', scope: '' });
		assert.deepStrictEqual(remainingLines, input);
	});

	test('Should strip comments from meta values', () => {
		const input = ['\\kind 既存変更 # メモ'];
		const { meta } = extractModuleMeta(input);

		assert.strictEqual(meta.kind, '既存変更');
	});

	test('Should accept free-form values such as extern/static', () => {
		const input = ['\\scope static'];
		const { meta } = extractModuleMeta(input);

		assert.strictEqual(meta.scope, 'static');
	});

	test('Should keep the last value when a marker repeats', () => {
		const input = ['\\kind 新規作成', '\\kind 既存流用'];
		const { meta } = extractModuleMeta(input);

		assert.strictEqual(meta.kind, '既存流用');
	});
});

suite('file_parse - Function - extractTables', () => {
	test('Should extract a simple table and treat first row as header', () => {
		const input = [
			'\\table',
			'名称, 目的, 初期値',
			'チェック対象, Byteデータ, 引数依存',
		];
		const { tables, remainingLines } = extractTables(input);

		assert.strictEqual(tables.length, 1);
		assert.strictEqual(tables[0].caption, '');
		assert.deepStrictEqual(cellsOf(tables[0].rows), [
			['名称', '目的', '初期値'],
			['チェック対象', 'Byteデータ', '引数依存'],
		]);
		assert.deepStrictEqual(remainingLines, []);
	});

	test('Should collapse consecutive commas into a single separator', () => {
		const input = [
			'\\table',
			'ループカウンタ, コマンド種別だけ繰り返す, 0',
			'ループカウンタ,,,, コマンド種別だけ繰り返す,, 0',
			'ループカウンタ,,, コマンド種別だけ繰り返す, 0',
		];
		const { tables } = extractTables(input);

		// 3行とも同じ3列になる
		const expectedRow = ['ループカウンタ', 'コマンド種別だけ繰り返す', '0'];
		assert.strictEqual(tables.length, 1);
		assert.deepStrictEqual(cellsOf(tables[0].rows), [expectedRow, expectedRow, expectedRow]);
	});

	test('Should trim leading/trailing commas and whitespace', () => {
		const input = ['\\table', ' , a , , b , '];
		const { tables } = extractTables(input);

		assert.deepStrictEqual(cellsOf(tables[0].rows), [['a', 'b']]);
	});

	test('Should capture caption after the marker', () => {
		const input = ['\\table 設定一覧', 'a, b'];
		const { tables } = extractTables(input);

		assert.strictEqual(tables[0].caption, '設定一覧');
		assert.deepStrictEqual(cellsOf(tables[0].rows), [['a', 'b']]);
	});

	test('Should terminate a table at a blank line', () => {
		const input = [
			'\\table',
			'a, b',
			'',
			'通常行',
		];
		const { tables, remainingLines } = extractTables(input);

		assert.deepStrictEqual(cellsOf(tables[0].rows), [['a', 'b']]);
		assert.deepStrictEqual(remainingLines, ['', '通常行']);
	});

	test('Should terminate a table at a module line', () => {
		const input = [
			'\\table',
			'a, b',
			'\\module next',
			'line1',
		];
		const { tables, remainingLines } = extractTables(input);

		assert.deepStrictEqual(cellsOf(tables[0].rows), [['a', 'b']]);
		assert.deepStrictEqual(remainingLines, ['\\module next', 'line1']);
	});

	test('Should terminate a table at a data line', () => {
		const input = [
			'\\table',
			'名称, 目的',
			'チェック対象, Byteデータ',
			'\\data チェック対象',
			'    処理する \\in チェック対象',
		];
		const { tables, remainingLines } = extractTables(input);

		assert.deepStrictEqual(cellsOf(tables[0].rows), [['名称', '目的'], ['チェック対象', 'Byteデータ']]);
		assert.deepStrictEqual(remainingLines, ['\\data チェック対象', '    処理する \\in チェック対象']);
	});

	test('Should handle multiple tables', () => {
		const input = [
			'\\table 表1',
			'a, b',
			'',
			'\\table 表2',
			'c, d',
		];
		const { tables } = extractTables(input);

		assert.strictEqual(tables.length, 2);
		assert.strictEqual(tables[0].caption, '表1');
		assert.deepStrictEqual(cellsOf(tables[0].rows), [['a', 'b']]);
		assert.strictEqual(tables[1].caption, '表2');
		assert.deepStrictEqual(cellsOf(tables[1].rows), [['c', 'd']]);
	});

	test('Should ignore comments within table rows', () => {
		const input = ['\\table', 'a, b # コメント', 'c, d'];
		const { tables } = extractTables(input);

		assert.deepStrictEqual(cellsOf(tables[0].rows), [['a', 'b'], ['c', 'd']]);
	});

	test('Should record depth from leading indentation as struct hierarchy', () => {
		const input = [
			'\\table',
			'記録, 作業日時を記録する, -',
			'    年月日, 年月日を記録する, -',
			'        年, 年を記録する, 2000',
			'\t時分, 時分を記録する, -',
		];
		const { tables } = extractTables(input);

		// 4スペース=1階層、タブ1個=1階層
		assert.deepStrictEqual(tables[0].rows.map(row => row.depth), [0, 1, 2, 1]);
		assert.deepStrictEqual(cellsOf(tables[0].rows), [
			['記録', '作業日時を記録する', '-'],
			['年月日', '年月日を記録する', '-'],
			['年', '年を記録する', '2000'],
			['時分', '時分を記録する', '-'],
		]);
	});

	test('Should not produce a table when no rows follow the marker', () => {
		const input = ['\\table', '', '通常行'];
		const { tables, remainingLines } = extractTables(input);

		assert.deepStrictEqual(tables, []);
		assert.deepStrictEqual(remainingLines, ['', '通常行']);
	});

	test('Should leave lines untouched when no marker exists', () => {
		const input = ['a, b', 'c, d', '通常行'];
		const { tables, remainingLines } = extractTables(input);

		assert.deepStrictEqual(tables, []);
		assert.deepStrictEqual(remainingLines, input);
	});

	test('Should return empty results for empty input', () => {
		const { tables, remainingLines } = extractTables([]);

		assert.deepStrictEqual(tables, []);
		assert.deepStrictEqual(remainingLines, []);
	});
});

suite('file_parse - Integration', () => {
	test('Should extract a per-module table placed between \\module and \\data', () => {
		const input =
			'\\module 有効なデータをチェックする\n' +
			'\\table データ定義\n' +
			'名称, 目的, 初期値\n' +
			'ループカウンタ,,,, コマンド種別だけ繰り返す,, 0\n' +
			'\\data ループカウンタ\n' +
			'    処理する \\in ループカウンタ';

		const modules = parseModules(input);
		assert.strictEqual(modules.length, 1);

		const { tables, remainingLines } = extractTables(modules[0].content);

		assert.strictEqual(tables.length, 1);
		assert.strictEqual(tables[0].caption, 'データ定義');
		assert.deepStrictEqual(cellsOf(tables[0].rows), [
			['名称', '目的', '初期値'],
			['ループカウンタ', 'コマンド種別だけ繰り返す', '0'],
		]);
		// 表より後ろ(\data・処理行)は残る
		assert.deepStrictEqual(remainingLines, ['\\data ループカウンタ', '    処理する \\in ループカウンタ']);
	});

	test('Should scope tables to each module independently', () => {
		const input =
			'\\module mod1\n' +
			'\\table\n' +
			'a, b\n' +
			'\\data a\n' +
			'\\module mod2\n' +
			'\\table\n' +
			'c, d\n' +
			'\\data c';

		const modules = parseModules(input);
		assert.strictEqual(modules.length, 2);

		const tables1 = extractTables(modules[0].content).tables;
		const tables2 = extractTables(modules[1].content).tables;

		assert.deepStrictEqual(cellsOf(tables1[0].rows), [['a', 'b']]);
		assert.deepStrictEqual(cellsOf(tables2[0].rows), [['c', 'd']]);
	});
});

suite('file_parse - Integration - legacy', () => {
	test('Should parse modules and clean content correctly', () => {
		const input =
			'ignored line\n' +
			'\\module test1\n' +
			'line1 # comment\n' +
			'# full comment line\n' +
			'\n' +
			'  line2\n' +
			'\\module  test2  \n' +
			'\tline3\n' +
			'line4 # another comment';

		const modules = parseModules(input);
		const cleanedModules: Module[] = modules.map(module => ({
			name: module.name,
			content: cleanTextLines(module.content)
		}));

		const expected: Module[] = [
			{
				name: 'test1',
				content: ['line1 ', '  line2']
			},
			{
				name: 'test2',
				content: ['\tline3', 'line4 ']
			}
		];

		assert.deepStrictEqual(cleanedModules, expected);
	});
});
