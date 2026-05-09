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
const data_define_1 = require("../../parse/data_define");
suite('IOTypeFormat - Class', () => {
    test('should be initialized correctly', () => {
        const format = new data_define_1.IOTypeFormat(1, '\\test');
        assert.strictEqual(format.type_value, 1);
        assert.strictEqual(format.type_format, '\\test');
        const defaultFormat = new data_define_1.IOTypeFormat();
        assert.strictEqual(defaultFormat.type_value, 0);
        assert.strictEqual(defaultFormat.type_format, '');
    });
});
suite('IOTypeDefine - Method - get_format_by_type', () => {
    test(' should return correct format', () => {
        const normalFormat = data_define_1.IOTypeDefine.get_format_by_type(data_define_1.IOTypeEnum.IN);
        assert.strictEqual(normalFormat.type_value, 0);
        assert.strictEqual(normalFormat.type_format, '\\in');
        const forkFormat = data_define_1.IOTypeDefine.get_format_by_type(data_define_1.IOTypeEnum.OUT);
        assert.strictEqual(forkFormat.type_value, 1);
        assert.strictEqual(forkFormat.type_format, '\\out');
    });
});
suite('IOTypeDefine - Method - get_type_by_format', () => {
    test('should return correct type', () => {
        assert.strictEqual(data_define_1.IOTypeDefine.get_type_by_format('\\in'), data_define_1.IOTypeEnum.IN);
        assert.strictEqual(data_define_1.IOTypeDefine.get_type_by_format('\\out'), data_define_1.IOTypeEnum.OUT);
        // Non-existent format should return undefined
        assert.strictEqual(data_define_1.IOTypeDefine.get_type_by_format('\\nonexistent'), undefined);
        assert.strictEqual(data_define_1.IOTypeDefine.get_type_by_format(''), undefined);
    });
});
//# sourceMappingURL=data_define.test.js.map