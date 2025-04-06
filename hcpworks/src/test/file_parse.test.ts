import { parseModules, cleanTextLines, Module } from '../file_parse';
import * as assert from 'assert';
import * as vscode from 'vscode';


suite('File Parse Test Suite', () => {
	vscode.window.showInformationMessage('Start file parsing tests.');

	suite('parseModules function', () => {
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
});
