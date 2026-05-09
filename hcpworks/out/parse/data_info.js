"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InOutData = exports.DataInfo = void 0;
/**
 * データ情報を表すクラス
 */
class DataInfo {
    name;
    connectLine;
    constructor(name) {
        this.name = name;
        this.connectLine = null;
    }
}
exports.DataInfo = DataInfo;
/**
 * 入出力データを表すクラス
 */
class InOutData {
    _inDataList;
    _outDataList;
    constructor() {
        this._inDataList = [];
        this._outDataList = [];
    }
    getInDataList() { return this._inDataList; }
    setInDataList(dataList) {
        this._inDataList = dataList;
        return this;
    }
    getOutDataList() { return this._outDataList; }
    setOutDataList(dataList) {
        this._outDataList = dataList;
        return this;
    }
}
exports.InOutData = InOutData;
//# sourceMappingURL=data_info.js.map