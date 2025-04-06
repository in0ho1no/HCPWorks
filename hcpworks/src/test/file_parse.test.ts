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
		
	});
});
