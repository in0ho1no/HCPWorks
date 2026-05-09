"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommonDataInfo = exports.LineInfo = void 0;
const line_level_1 = require("./line_level");
const line_type_1 = require("./line_type");
const line_define_1 = require("./line_define");
const data_define_1 = require("./data_define");
const data_info_1 = require("./data_info");
class LineInfo {
    static DEFAULT_VALUE = -1;
    _textOriginal;
    _level;
    _type;
    _textLessType;
    _InOutData;
    _textLessTypeIo;
    _no;
    _beforeNo;
    _nextNo;
    constructor() {
        this._textOriginal = '';
        this._level = 0;
        this._type = new line_define_1.LineTypeFormat();
        this._textLessType = '';
        this._InOutData = new data_info_1.InOutData();
        this._textLessTypeIo = '';
        this._no = 0;
        this._beforeNo = LineInfo.DEFAULT_VALUE;
        this._nextNo = LineInfo.DEFAULT_VALUE;
    }
    setTextOrg(text) {
        this._textOriginal = text;
        return this;
    }
    getLevel() { return this._level; }
    setLevel(level) {
        if (level < line_level_1.LineLevel.LEVEL_MIN) {
            throw new Error("Invalid level value: " + level);
        }
        this._level = level;
        return this;
    }
    updateLevel() {
        this._level = line_level_1.LineLevel.getLineLevel(this._textOriginal);
        return this;
    }
    getType() { return this._type; }
    updateType() {
        [this._type, this._textLessType] = line_type_1.LineType.get_line_type(this._textOriginal);
        return this;
    }
    getTextLessTypeIO() { return this._textLessTypeIo; }
    setTextLessTypeIO(text) { this._textLessTypeIo = text; return this; }
    getInOutData() { return this._InOutData; }
    updateLineIO() {
        // inとoutの正規表現を用意
        const common_ptn = "\\s+(\\S+)?";
        const in_ptn = new RegExp("\\" + data_define_1.IOTypeDefine.get_format_by_type(data_define_1.IOTypeEnum.IN).type_format + common_ptn, 'g');
        const out_ptn = new RegExp("\\" + data_define_1.IOTypeDefine.get_format_by_type(data_define_1.IOTypeEnum.OUT).type_format + common_ptn, 'g');
        // inとoutのデータ名を抽出
        const inMatches = Array.from(this._textLessType.matchAll(in_ptn));
        const outMatches = Array.from(this._textLessType.matchAll(out_ptn));
        // データを対応するリストに格納
        const inDataList = inMatches.map(match => new data_info_1.DataInfo(match[1]));
        const outDataList = outMatches.map(match => new data_info_1.DataInfo(match[1]));
        // inとout要素を取り除いた行を取得
        const cleanedText = this._textLessType.replace(in_ptn, "").replace(out_ptn, "").trim();
        this._InOutData = new data_info_1.InOutData().setInDataList(inDataList).setOutDataList(outDataList);
        this._textLessTypeIo = cleanedText;
        return this;
    }
    getLineNo() { return this._no; }
    setLineNo(no) {
        this._no = no;
        return this;
    }
    getBeforeLineNo() { return this._beforeNo; }
    setBeforeLineNo(no) {
        this._beforeNo = no;
        return this;
    }
    getNextLineNo() { return this._nextNo; }
    setNextLineNo(no) {
        this._nextNo = no;
        return this;
    }
}
exports.LineInfo = LineInfo;
/**
 * データ名に基づいて、データ部に相当する情報を作成する
 *
 * @param dataName データ名
 * @param dataLevel データレベル
 * @returns 作成したdataの情報
 */
const createCommonDataInfo = (dataName, dataLevel) => {
    const dataInfo = new LineInfo();
    dataInfo.setTextOrg("\\data " + dataName);
    dataInfo.setLevel(dataLevel);
    dataInfo.updateType();
    dataInfo.setTextLessTypeIO(dataName);
    return dataInfo;
};
exports.createCommonDataInfo = createCommonDataInfo;
//# sourceMappingURL=line_info.js.map