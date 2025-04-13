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
  private _textTypeless: string;
  private _InOutData: InOutData | null;
  private _textTypeIOless: string;

  private _no: number;
  private _beforeNo: number;
  private _nextNo: number;

  constructor() {
    this._textOriginal = '';
    this._level = 0;
    this._type = new LineTypeFormat();
    this._textTypeless = '';
    this._InOutData = null;
    this._textTypeIOless = '';

    this._no = 0;
    this._beforeNo = 0;
    this._nextNo = 0;
  }

  setTextOrg(text: string): LineInfo {
    this._textOriginal = text;
    return this;
  }

  getLevel(): number { return this._level; }
  updateLevel(): LineInfo {
    this._level = LineLevel.getLineLevel(this._textOriginal);
    return this;
  }

  getType(): LineTypeFormat { return this._type; }
  updateType(): LineInfo {
    [this._type, this._textTypeless] = LineType.get_line_type(this._textOriginal);
    return this;
  }

  getTextLessTypeIO(): string { return this._textTypeIOless; }
  updateLineIO(): LineInfo {
    // inとoutの正規表現を用意
    const common_ptn = "\\s+(\\S+)?";
    const in_ptn = new RegExp("\\" + IOTypeDefine.get_format_by_type(IOTypeEnum.IN).type_format + common_ptn, 'g');
    const out_ptn = new RegExp("\\" + IOTypeDefine.get_format_by_type(IOTypeEnum.OUT).type_format + common_ptn, 'g');

    // inとoutのデータ名を抽出
    const inMatches = Array.from(this._textTypeless.matchAll(in_ptn));
    const outMatches = Array.from(this._textTypeless.matchAll(out_ptn));

    // データを対応するリストに格納
    const inDataList = inMatches.map(match => new DataInfo(match[1]));
    const outDataList = outMatches.map(match => new DataInfo(match[1]));

    // inとout要素を取り除いた行を取得
    const cleanedText = this._textTypeless.replace(in_ptn, "").replace(out_ptn, "").trim();

    this._InOutData = new InOutData(inDataList, outDataList);
    this._textTypeIOless = cleanedText;

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
