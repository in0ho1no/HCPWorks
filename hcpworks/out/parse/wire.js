"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Process2Data = exports.Wire = void 0;
/**
 * 線を表すクラス
 */
class Wire {
    start;
    end;
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    /**
     * 線の幅を計算する
     * @returns 線の幅
     */
    wireWidth() {
        return Math.abs(this.start.x - this.end.x);
    }
    /**
     * 線の高さを計算する
     * @returns 線の高さ
     */
    wireHeight() {
        return Math.abs(this.start.y - this.end.y);
    }
}
exports.Wire = Wire;
/**
 * 処理からデータへの接続を表すインターフェース
 */
class Process2Data {
    exitFromProcess;
    betweenProcessData;
    enterToData;
    color;
    constructor() {
        this.exitFromProcess = null;
        this.betweenProcessData = null;
        this.enterToData = null;
        this.color = '000000'; // black
    }
}
exports.Process2Data = Process2Data;
//# sourceMappingURL=wire.js.map