"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineLevel = void 0;
/**
 * テキスト行のインデントレベルを管理するクラス
 */
class LineLevel {
    static LEVEL_MIN = 0;
    static LEVEL_MAX = 30;
    static LEVEL_ERROR = -1;
    static LEVEL_NONE = -2;
    static TAB2SPACE = 4;
    _level;
    constructor() {
        this._level = LineLevel.LEVEL_MIN;
    }
    /**
     * インデントパターンを動的に生成する
     *
     * 行頭は タブ*n個 もしくは 半角空白m個 で、任意の文字が続いて行末 となるパターン
     *
     * @param tabCount - タブの数
     * @returns 生成したインデントパターンの正規表現
     * @throws Error tab_countが負の数の場合
     */
    static createIndentPattern(tabCount) {
        if (tabCount < 0) {
            throw new Error("tabCount must be non-negative");
        }
        // タブと半角スペースを変換する
        const spaceCount = tabCount * this.TAB2SPACE;
        // 正規表現を作成する
        const pattern = `^(?:[ ]{${spaceCount}}|\\t{${tabCount}})\\S.*$`;
        return pattern;
    }
    /**
     * 与えられた行のレベルを取得する
     *
     * インデントの記載に誤りがあればエラーを返す
     *
     * @param line - レベルを取得したい行
     * @returns タブの数(半角空白なら4文字)をレベルとして返す
     */
    static getLineLevel(line) {
        // 空行は無視する
        const stripLine = line.trim();
        if (stripLine === "") {
            return this.LEVEL_NONE;
        }
        // レベル0から順にインデントをチェックする
        for (let level = this.LEVEL_MIN; level < this.LEVEL_MAX; level++) {
            // レベルに応じたチェックパターンを生成する
            const tabCount = level;
            const pattern = this.createIndentPattern(tabCount);
            // 該当したレベルを返す
            if (new RegExp(pattern).test(line)) {
                return level;
            }
        }
        throw new Error(`Wrong indent pattern: ${line}`);
    }
}
exports.LineLevel = LineLevel;
//# sourceMappingURL=line_level.js.map