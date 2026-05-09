"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const file_parse_1 = require("../../parse/file_parse");
suite('file_parse - Function - parseModules', () => {
    test('Should parse a single module correctly', () => {
        const input = '\\module test\nline1\nline2\nline3';
        const expected = [
            {
                name: 'test',
                content: ['line1', 'line2', 'line3']
            }
        ];
        assert.deepStrictEqual((0, file_parse_1.parseModules)(input), expected);
    });
    test('Should parse multiple modules correctly', () => {
        const input = '\\module module1\nline1\nline2\n\\module module2\nline3\nline4';
        const expected = [
            {
                name: 'module1',
                content: ['line1', 'line2']
            },
            {
                name: 'module2',
                content: ['line3', 'line4']
            }
        ];
        assert.deepStrictEqual((0, file_parse_1.parseModules)(input), expected);
    });
    test('Should return empty array for empty file', () => {
        assert.deepStrictEqual((0, file_parse_1.parseModules)(''), []);
    });
    test('Should handle module definition with no content', () => {
        const input = '\\module test';
        const expected = [
            {
                name: 'test',
                content: []
            }
        ];
        assert.deepStrictEqual((0, file_parse_1.parseModules)(input), expected);
    });
    test('Should handle extra spaces in module name', () => {
        const input = '\\module  test  \nline1';
        const expected = [
            {
                name: 'test',
                content: ['line1']
            }
        ];
        assert.deepStrictEqual((0, file_parse_1.parseModules)(input), expected);
    });
    test('Should ignore lines before first module definition', () => {
        const input = 'ignore this\nignore this too\n\\module test\nline1';
        const expected = [
            {
                name: 'test',
                content: ['line1']
            }
        ];
        assert.deepStrictEqual((0, file_parse_1.parseModules)(input), expected);
    });
});
suite('file_parse - Function - cleanTextLines', () => {
    test('Should remove comments', () => {
        const input = ['line1 # comment', 'line2# comment', 'line3 #comment'];
        const expected = ['line1 ', 'line2', 'line3 '];
        assert.deepStrictEqual((0, file_parse_1.cleanTextLines)(input), expected);
    });
    test('Should ignore empty lines', () => {
        const input = ['line1', '', '   ', 'line2'];
        const expected = ['line1', 'line2'];
        assert.deepStrictEqual((0, file_parse_1.cleanTextLines)(input), expected);
    });
    test('Should ignore comment-only lines', () => {
        const input = ['line1', '# comment only', 'line2'];
        const expected = ['line1', 'line2'];
        assert.deepStrictEqual((0, file_parse_1.cleanTextLines)(input), expected);
    });
    test('Should ignore lines with only spaces and comments', () => {
        const input = ['line1', '  # comment with spaces', 'line2'];
        const expected = ['line1', 'line2'];
        assert.deepStrictEqual((0, file_parse_1.cleanTextLines)(input), expected);
    });
    test('Should preserve leading whitespace', () => {
        const input = ['  line1', '\tline2', ' \t line3'];
        const expected = ['  line1', '\tline2', ' \t line3'];
        assert.deepStrictEqual((0, file_parse_1.cleanTextLines)(input), expected);
    });
    test('Should handle multiple # characters', () => {
        const input = ['line with # comment # and more #', 'line2 ## double hash'];
        const expected = ['line with ', 'line2 '];
        assert.deepStrictEqual((0, file_parse_1.cleanTextLines)(input), expected);
    });
    test('Should return empty array for empty input', () => {
        assert.deepStrictEqual((0, file_parse_1.cleanTextLines)([]), []);
    });
});
suite('file_parse - Integration', () => {
    test('Should parse modules and clean content correctly', () => {
        const input = 'ignored line\n' +
            '\\module test1\n' +
            'line1 # comment\n' +
            '# full comment line\n' +
            '\n' +
            '  line2\n' +
            '\\module  test2  \n' +
            '\tline3\n' +
            'line4 # another comment';
        const modules = (0, file_parse_1.parseModules)(input);
        const cleanedModules = modules.map(module => ({
            name: module.name,
            content: (0, file_parse_1.cleanTextLines)(module.content)
        }));
        const expected = [
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
//# sourceMappingURL=file_parse.test.js.map