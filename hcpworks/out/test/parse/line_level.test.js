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
const line_level_1 = require("../../parse/line_level");
suite('LineLevel - Class', () => {
    test('constructor should initialize value to LEVEL_MIN', () => {
        const lineLevel = new line_level_1.LineLevel();
        // @ts-ignore: privateプロパティにアクセスするため
        assert.strictEqual(lineLevel._level, line_level_1.LineLevel.LEVEL_MIN);
    });
    suite('LineLevel - Method - createIndentPattern', () => {
        test('should create correct pattern for tab count 0', () => {
            const pattern = line_level_1.LineLevel.createIndentPattern(0);
            assert.strictEqual(pattern, '^(?:[ ]{0}|\\t{0})\\S.*$');
            // パターンが正しく動作するか検証
            const regex = new RegExp(pattern);
            assert.strictEqual(regex.test('abc'), true); // インデントなしの行
            assert.strictEqual(regex.test(' abc'), false); // スペース1つの行
            assert.strictEqual(regex.test('\tabc'), false); // タブ1つの行
        });
        test('should create correct pattern for tab count 1', () => {
            const pattern = line_level_1.LineLevel.createIndentPattern(1);
            assert.strictEqual(pattern, '^(?:[ ]{4}|\\t{1})\\S.*$');
            // パターンが正しく動作するか検証
            const regex = new RegExp(pattern);
            assert.strictEqual(regex.test('abc'), false); // インデントなしの行
            assert.strictEqual(regex.test('    abc'), true); // スペース4つの行
            assert.strictEqual(regex.test('\tabc'), true); // タブ1つの行
            assert.strictEqual(regex.test('  abc'), false); // スペース2つの行
        });
        test('should create correct pattern for tab count 2', () => {
            const pattern = line_level_1.LineLevel.createIndentPattern(2);
            assert.strictEqual(pattern, '^(?:[ ]{8}|\\t{2})\\S.*$');
            // パターンが正しく動作するか検証
            const regex = new RegExp(pattern);
            assert.strictEqual(regex.test('        abc'), true); // スペース8つの行
            assert.strictEqual(regex.test('\t\tabc'), true); // タブ2つの行
            assert.strictEqual(regex.test('    abc'), false); // スペース4つの行
        });
        test('should throw error for negative tab count', () => {
            assert.throws(() => {
                line_level_1.LineLevel.createIndentPattern(-1);
            }, /tabCount must be non-negative/);
        });
    });
    suite('LineLevel - Method - getLineLevel', () => {
        test('should return LEVEL_NONE for empty lines', () => {
            assert.strictEqual(line_level_1.LineLevel.getLineLevel(''), line_level_1.LineLevel.LEVEL_NONE);
            assert.strictEqual(line_level_1.LineLevel.getLineLevel('  '), line_level_1.LineLevel.LEVEL_NONE);
            assert.strictEqual(line_level_1.LineLevel.getLineLevel('\t'), line_level_1.LineLevel.LEVEL_NONE);
        });
        test('should return correct level for indented lines', () => {
            // レベル0
            assert.strictEqual(line_level_1.LineLevel.getLineLevel('abc'), 0);
            // レベル1
            assert.strictEqual(line_level_1.LineLevel.getLineLevel('    abc'), 1);
            assert.strictEqual(line_level_1.LineLevel.getLineLevel('\tabc'), 1);
            // レベル2
            assert.strictEqual(line_level_1.LineLevel.getLineLevel('        abc'), 2);
            assert.strictEqual(line_level_1.LineLevel.getLineLevel('\t\tabc'), 2);
            // レベル3
            assert.strictEqual(line_level_1.LineLevel.getLineLevel('            abc'), 3);
            assert.strictEqual(line_level_1.LineLevel.getLineLevel('\t\t\tabc'), 3);
        });
        test('should throw error for invalid indent patterns', () => {
            assert.throws(() => {
                // 混合インデント（タブとスペース）は不正
                line_level_1.LineLevel.getLineLevel('\t  abc');
            }, /Wrong indent pattern/);
            assert.throws(() => {
                // スペース数が4の倍数でない場合は不正
                line_level_1.LineLevel.getLineLevel('   abc'); // スペース3つ
            }, /Wrong indent pattern/);
            // 行が長すぎる場合（レベル超過）
            const longIndent = ' '.repeat(line_level_1.LineLevel.LEVEL_MAX * line_level_1.LineLevel.TAB2SPACE) + 'abc';
            assert.throws(() => {
                line_level_1.LineLevel.getLineLevel(longIndent);
            }, /Wrong indent pattern/);
        });
    });
});
//# sourceMappingURL=line_level.test.js.map