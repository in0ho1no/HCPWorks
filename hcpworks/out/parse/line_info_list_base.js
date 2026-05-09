"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLineProcessor = void 0;
const line_level_1 = require("./line_level");
/**
 * LineProcessorの基底クラス
 */
class BaseLineProcessor {
    _lineInfoList;
    _minLevel;
    constructor() {
        this._lineInfoList = [];
        this._minLevel = 0;
    }
    /**
     * ラインリストを設定する
     * @param lineInfoList 設定するラインリスト
     * @returns このインスタンスへの参照（メソッドチェーン用）
     */
    setLineInfoList(lineInfoList) {
        this._lineInfoList = lineInfoList;
        return this;
    }
    getLineInfoList() { return this._lineInfoList; }
    /**
     * 行番号を設定する
     * @returns このインスタンスへの参照（メソッドチェーン用）
     */
    setInfoListNo() {
        // forEachを使用して各要素に処理を適用
        this._lineInfoList.forEach((lineInfo, index) => {
            lineInfo.setLineNo(index);
        });
        return this;
    }
    /**
     * 各行のレベルに応じた前後関係を決定する
     * @returns このインスタンスへの参照（メソッドチェーン用）
     */
    assignLineRelationships() {
        // 昇順で前後関係を決める
        for (let currentIndex = 0; currentIndex < this._lineInfoList.length; currentIndex++) {
            const currentLine = this._lineInfoList[currentIndex];
            const currentLevel = currentLine.getLevel();
            // 同じレベルで1つ前の番号を見つけるために降順で探索
            for (let searchIndex = currentIndex - 1; searchIndex >= 0; searchIndex--) {
                const searchLine = this._lineInfoList[searchIndex];
                const searchLevel = searchLine.getLevel();
                if (searchLevel === currentLevel) {
                    // 1つ前の番号を保持する
                    currentLine.setBeforeLineNo(searchLine.getLineNo());
                    // 同時に次の番号として保存する
                    searchLine.setNextLineNo(currentLine.getLineNo());
                    break;
                }
                else if (searchLevel < currentLevel) {
                    // 自身よりレベルが小さい行を跨いで接続することはない
                    break;
                }
                else {
                    // 自身よりレベルが高い行は跨いで接続することがあるので探索を続ける
                }
            }
        }
        return this;
    }
    /**
     * リストから重複した要素を除外する
     * @returns このインスタンスへの参照（メソッドチェーン用）
     */
    removeDuplicate() {
        const removedDuplicateList = [];
        const checkedTextList = [];
        for (const lineInfo of this._lineInfoList) {
            // 未登録の名前だけを新規リストへ登録する
            const checkText = lineInfo.getTextLessTypeIO();
            if (!checkedTextList.includes(checkText)) {
                removedDuplicateList.push(lineInfo);
                checkedTextList.push(checkText);
            }
        }
        this._lineInfoList = removedDuplicateList;
        return this;
    }
    /**
     * リスト内の最小レベルを取得する
     * @returns このインスタンスへの参照（メソッドチェーン用）
     */
    setMinLevel() {
        let minLevel = line_level_1.LineLevel.LEVEL_MAX;
        for (const lineInfo of this._lineInfoList) {
            minLevel = Math.min(minLevel, lineInfo.getLevel());
        }
        this._minLevel = minLevel;
        return this;
    }
    getMinLevel() { return this._minLevel; }
}
exports.BaseLineProcessor = BaseLineProcessor;
//# sourceMappingURL=line_info_list_base.js.map