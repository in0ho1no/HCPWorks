"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseInfo4Render = void 0;
const line_info_1 = require("./line_info");
/**
 * レンダー向けのパース情報
 */
class ParseInfo4Render {
    _processLines;
    _dataLines;
    constructor(processLines, dataLines) {
        this._processLines = processLines;
        this._dataLines = dataLines;
    }
    /**
     * 処理部のin/outからdataの情報リストを作成する
     *
     * @returns 作成したdataの情報リスト
     */
    __createIoDataLineInfoList() {
        const ioDataInfoList = [];
        for (const lineInfo of this._processLines.getLineInfoList()) {
            const inOutData = lineInfo.getInOutData();
            const dataMinLevel = this._dataLines.getMinLevel();
            // \in を \data情報化
            for (const inData of inOutData.getInDataList()) {
                const inDataInfo = (0, line_info_1.createCommonDataInfo)(inData.name, dataMinLevel);
                ioDataInfoList.push(inDataInfo);
            }
            // \out を \data情報化
            for (const outData of inOutData.getOutDataList()) {
                const outDataInfo = (0, line_info_1.createCommonDataInfo)(outData.name, dataMinLevel);
                ioDataInfoList.push(outDataInfo);
            }
        }
        return ioDataInfoList;
    }
    /**
     * 処理部から抽出した入出力データをデータ部のリストへ追加する
     *
     * @param ioDataList 入出力データのリスト
     */
    __appendIoData(ioDataList) {
        for (const ioData of ioDataList) {
            // 保持済みのリストから名前だけのリストを用意する
            const infoNameList = this._dataLines.getLineInfoList().map(lineInfo => lineInfo.getTextLessTypeIO());
            // 未保持ならリストへ追加する
            if (!infoNameList.includes(ioData.getTextLessTypeIO())) {
                this._dataLines.getLineInfoList().push(ioData);
            }
        }
    }
    /**
     * 処理部のみに記載されたin/outをdata部の情報として追加する
     */
    mergeIoData() {
        const ioDataInfoList = this.__createIoDataLineInfoList();
        this.__appendIoData(ioDataInfoList);
    }
    getProcessLines() { return this._processLines; }
    getDataLines() { return this._dataLines; }
}
exports.ParseInfo4Render = ParseInfo4Render;
//# sourceMappingURL=parse_info_4_render.js.map