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
const wire_1 = require("../../parse/wire");
suite('Wire - Class', () => {
    test('wireWidth calculation', () => {
        const wire1 = new wire_1.Wire({ x: 0, y: 0 }, { x: 10, y: 0 });
        assert.strictEqual(wire1.wireWidth(), 10, 'Positive width should be calculated correctly');
        const wire2 = new wire_1.Wire({ x: 10, y: 0 }, { x: 0, y: 0 });
        assert.strictEqual(wire2.wireWidth(), 10, 'Width should be absolute when end < start');
        const wire3 = new wire_1.Wire({ x: 5, y: 0 }, { x: 5, y: 10 });
        assert.strictEqual(wire3.wireWidth(), 0, 'Width should be 0 for vertical wire');
    });
    test('wireHeight calculation', () => {
        const wire1 = new wire_1.Wire({ x: 0, y: 0 }, { x: 0, y: 10 });
        assert.strictEqual(wire1.wireHeight(), 10, 'Positive height should be calculated correctly');
        const wire2 = new wire_1.Wire({ x: 0, y: 10 }, { x: 0, y: 0 });
        assert.strictEqual(wire2.wireHeight(), 10, 'Height should be absolute when end < start');
        const wire3 = new wire_1.Wire({ x: 0, y: 5 }, { x: 10, y: 5 });
        assert.strictEqual(wire3.wireHeight(), 0, 'Height should be 0 for horizontal wire');
    });
    test('should calculate width and height for diagonal wires', () => {
        const wire = new wire_1.Wire({ x: 5, y: 5 }, { x: 15, y: 25 });
        assert.strictEqual(wire.wireWidth(), 10);
        assert.strictEqual(wire.wireHeight(), 20);
    });
    test('should handle zero length wires', () => {
        const zerowire = new wire_1.Wire({ x: 5, y: 5 }, { x: 5, y: 5 });
        assert.strictEqual(zerowire.wireWidth(), 0);
        assert.strictEqual(zerowire.wireHeight(), 0);
    });
    test('should handle negative coordinates', () => {
        const wire = new wire_1.Wire({ x: -10, y: -20 }, { x: -5, y: -5 });
        assert.strictEqual(wire.wireWidth(), 5);
        assert.strictEqual(wire.wireHeight(), 15);
    });
});
suite('Process2Data - Class', () => {
    test('should create a Process2Data with default values', () => {
        const connection = new wire_1.Process2Data();
        assert.strictEqual(connection.exitFromProcess, null);
        assert.strictEqual(connection.betweenProcessData, null);
        assert.strictEqual(connection.enterToData, null);
        assert.strictEqual(connection.color, '000000');
    });
    test('should allow setting wires and color', () => {
        const connection = new wire_1.Process2Data();
        const wire1 = new wire_1.Wire({ x: 0, y: 0 }, { x: 10, y: 10 });
        const wire2 = new wire_1.Wire({ x: 10, y: 10 }, { x: 20, y: 10 });
        const wire3 = new wire_1.Wire({ x: 20, y: 10 }, { x: 30, y: 20 });
        connection.exitFromProcess = wire1;
        connection.betweenProcessData = wire2;
        connection.enterToData = wire3;
        connection.color = 'red';
        assert.deepStrictEqual(connection.exitFromProcess, wire1);
        assert.deepStrictEqual(connection.betweenProcessData, wire2);
        assert.deepStrictEqual(connection.enterToData, wire3);
        assert.strictEqual(connection.color, 'red');
    });
});
//# sourceMappingURL=wire.test.js.map