import { LineLevel } from './line_level';
import { LineType } from './line_type';
import { LineTypeFormat } from './line_define';

import { IOTypeEnum, IOTypeDefine } from './data_define';
import { DataInfo, InOutData } from './data_info';

export class LineInfo {
  static readonly DEFAULT_VALUE = -1;

  private _textOriginal: string;
  private _level: number;
  private _type: LineTypeFormat;
  private _textLessType: string;
  private _InOutData: InOutData;
  private _textLessTypeIo: string;

  private _no: number;
  private _beforeNo: number;
  private _nextNo: number;

  constructor() {
    this._textOriginal = '';
    this._level = 0;
    this._type = new LineTypeFormat();
    this._textLessType = '';
    this._InOutData = new InOutData();
    this._textLessTypeIo = '';

    this._no = 0;
    this._beforeNo = 0;
    this._nextNo = 0;
  }

  setTextOrg(text: string): LineInfo {
    this._textOriginal = text;
    return this;
  }

  getLevel(): number { return this._level; }
  setLevel(level: number): LineInfo { this._level = level; return this; }
  updateLevel(): LineInfo {
    this._level = LineLevel.getLineLevel(this._textOriginal);
    return this;
  }

  getType(): LineTypeFormat { return this._type; }
  updateType(): LineInfo {
    [this._type, this._textLessType] = LineType.get_line_type(this._textOriginal);
    return this;
  }

  getTextLessTypeIO(): string { return this._textLessTypeIo; }
  setTextLessTypeIO(text: string): LineInfo { this._textLessTypeIo = text; return this; }
  getInOutData(): InOutData { return this._InOutData; }
  updateLineIO(): LineInfo {
    // inとoutの正規表現を用意
    const common_ptn = "\\s+(\\S+)?";
    const in_ptn = new RegExp("\\" + IOTypeDefine.get_format_by_type(IOTypeEnum.IN).type_format + common_ptn, 'g');
    const out_ptn = new RegExp("\\" + IOTypeDefine.get_format_by_type(IOTypeEnum.OUT).type_format + common_ptn, 'g');

    // inとoutのデータ名を抽出
    const inMatches = Array.from(this._textLessType.matchAll(in_ptn));
    const outMatches = Array.from(this._textLessType.matchAll(out_ptn));

    // データを対応するリストに格納
    const inDataList = inMatches.map(match => new DataInfo(match[1]));
    const outDataList = outMatches.map(match => new DataInfo(match[1]));

    // inとout要素を取り除いた行を取得
    const cleanedText = this._textLessType.replace(in_ptn, "").replace(out_ptn, "").trim();

    this._InOutData = new InOutData().setInDataList(inDataList).setOutDataList(outDataList);
    this._textLessTypeIo = cleanedText;

    return this;
  }

  getLineNo(): number { return this._no; }
  setLineNo(no: number): LineInfo {
    this._no = no;
    return this;
  }

  getBeforeLineNo(): number { return this._beforeNo; }
  setBeforeLineNo(no: number): LineInfo {
    this._beforeNo = no;
    return this;
  }

  getNextLineNo(): number { return this._nextNo; }
  setNextLineNo(no: number): LineInfo {
    this._nextNo = no;
    return this;
  }
}

/**
 * データ名に基づいて、データ部に相当する情報を作成する
 * 
 * @param dataName データ名
 * @param dataLevel データレベル
 * @returns 作成したdataの情報
 */
export const createCommonDataInfo = (dataName: string, dataLevel: number): LineInfo => {
  const dataInfo = new LineInfo();
  dataInfo.setTextOrg("\\data " + dataName);
  dataInfo.setLevel(dataLevel);
  dataInfo.updateType();
  dataInfo.setTextLessTypeIO(dataName);
  return dataInfo;
};
