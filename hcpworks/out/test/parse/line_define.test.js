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
suite('LineTypeFormat - Class', () => {
    test('should be initialized correctly', () => {
        const format = new line_define_1.LineTypeFormat(1, '\\test');
        assert.strictEqual(format.type_value, 1);
        assert.strictEqual(format.type_format, '\\test');
        const defaultFormat = new line_define_1.LineTypeFormat();
        assert.strictEqual(defaultFormat.type_value, 0);
        assert.strictEqual(defaultFormat.type_format, '');
    });
});
suite('LineTypeDefine - Method - get_format_by_type', () => {
    test(' should return correct format', () => {
        const normalFormat = line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.NORMAL);
        assert.strictEqual(normalFormat.type_value, 0);
        assert.strictEqual(normalFormat.type_format, '');
        const forkFormat = line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.FORK);
        assert.strictEqual(forkFormat.type_value, 1);
        assert.strictEqual(forkFormat.type_format, '\\fork');
    });
});
suite('LineTypeDefine - Method - get_type_by_format', () => {
    test('should return correct type', () => {
        assert.strictEqual(line_define_1.LineTypeDefine.get_type_by_format('\\fork'), line_define_1.LineTypeEnum.FORK);
        assert.strictEqual(line_define_1.LineTypeDefine.get_type_by_format('\\repeat'), line_define_1.LineTypeEnum.REPEAT);
        assert.strictEqual(line_define_1.LineTypeDefine.get_type_by_format('\\mod'), line_define_1.LineTypeEnum.MOD);
        assert.strictEqual(line_define_1.LineTypeDefine.get_type_by_format('\\return'), line_define_1.LineTypeEnum.RETURN);
        assert.strictEqual(line_define_1.LineTypeDefine.get_type_by_format('\\true'), line_define_1.LineTypeEnum.TRUE);
        assert.strictEqual(line_define_1.LineTypeDefine.get_type_by_format('\\false'), line_define_1.LineTypeEnum.FALSE);
        assert.strictEqual(line_define_1.LineTypeDefine.get_type_by_format('\\branch'), line_define_1.LineTypeEnum.BRANCH);
        assert.strictEqual(line_define_1.LineTypeDefine.get_type_by_format('\\data'), line_define_1.LineTypeEnum.DATA);
        assert.strictEqual(line_define_1.LineTypeDefine.get_type_by_format('\\module'), line_define_1.LineTypeEnum.MODULE);
        // Non-existent format should return undefined
        assert.strictEqual(line_define_1.LineTypeDefine.get_type_by_format('\\nonexistent'), undefined);
        assert.strictEqual(line_define_1.LineTypeDefine.get_type_by_format(''), undefined);
    });
});
//# sourceMappingURL=line_define.test.js.map