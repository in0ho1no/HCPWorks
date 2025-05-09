import * as assert from 'assert';
import { parseModules, cleanTextLines, Module } from '../../parse/file_parse';

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

suite('file_parse - Integration', () => {
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
