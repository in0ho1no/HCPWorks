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
const line_define_1 = require("../../parse/line_define");
const line_type_1 = require("../../parse/line_type");
suite('LineType - Method - get_line_type', () => {
    test('should return NORMAL for empty line', () => {
        const [emptyLineFormat, emptyLineRemainder] = line_type_1.LineType.get_line_type('');
        assert.strictEqual(emptyLineFormat.type_value, 0);
        assert.strictEqual(emptyLineFormat.type_format, '');
        assert.strictEqual(emptyLineRemainder, '');
    });
    test('should return NORMAL for normal line', () => {
        const [normalLineFormat, normalLineRemainder] = line_type_1.LineType.get_line_type('This is a normal line');
        assert.strictEqual(normalLineFormat.type_value, 0);
        assert.strictEqual(normalLineFormat.type_format, '');
        assert.strictEqual(normalLineRemainder, 'This is a normal line');
    });
    test('should correctly parse lines with type specifier', () => {
        const testCases = [
            { input: '\\fork test fork', expected: { type: line_define_1.LineTypeEnum.FORK, remainder: 'test fork' } },
            { input: '\\repeat loop 10 times', expected: { type: line_define_1.LineTypeEnum.REPEAT, remainder: 'loop 10 times' } },
            { input: '\\mod apply modification', expected: { type: line_define_1.LineTypeEnum.MOD, remainder: 'apply modification' } },
            { input: '\\return result', expected: { type: line_define_1.LineTypeEnum.RETURN, remainder: 'result' } },
            { input: '\\true condition satisfied', expected: { type: line_define_1.LineTypeEnum.TRUE, remainder: 'condition satisfied' } },
            { input: '\\false condition failed', expected: { type: line_define_1.LineTypeEnum.FALSE, remainder: 'condition failed' } },
            { input: '\\branch new branch', expected: { type: line_define_1.LineTypeEnum.BRANCH, remainder: 'new branch' } },
            { input: '\\data values', expected: { type: line_define_1.LineTypeEnum.DATA, remainder: 'values' } },
            { input: '\\module imported', expected: { type: line_define_1.LineTypeEnum.MODULE, remainder: 'imported' } },
        ];
        for (const testCase of testCases) {
            const [format, remainder] = line_type_1.LineType.get_line_type(testCase.input);
            const expectedFormat = line_define_1.LineTypeDefine.get_format_by_type(testCase.expected.type);
            assert.strictEqual(format.type_format, expectedFormat.type_format);
            assert.strictEqual(format.type_value, expectedFormat.type_value);
            assert.strictEqual(remainder, testCase.expected.remainder);
        }
    });
    test('should handle lines with only type specifier', () => {
        const [onlyCommandFormat, onlyCommandRemainder] = line_type_1.LineType.get_line_type('\\fork');
        const expectedFormat = line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.FORK);
        assert.strictEqual(onlyCommandFormat.type_value, expectedFormat.type_value);
        assert.strictEqual(onlyCommandFormat.type_format, expectedFormat.type_format);
        assert.strictEqual(onlyCommandRemainder, '');
    });
    test('should handle lines with unknown type specifier', () => {
        const [unknownLineFormat, unknownLineRemainder] = line_type_1.LineType.get_line_type('\\unknown test');
        assert.strictEqual(unknownLineFormat.type_value, 0);
        assert.strictEqual(unknownLineFormat.type_format, '');
        assert.strictEqual(unknownLineRemainder, '\\unknown test');
    });
    test('should handle lines with leading spaces', () => {
        const [paddedLineFormat, paddedLineRemainder] = line_type_1.LineType.get_line_type('    \\fork test with spaces');
        const expectedFormat = line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.FORK);
        assert.strictEqual(paddedLineFormat.type_value, expectedFormat.type_value);
        assert.strictEqual(paddedLineFormat.type_format, expectedFormat.type_format);
        assert.strictEqual(paddedLineRemainder, 'test with spaces');
    });
});
//# sourceMappingURL=line_type.test.js.map