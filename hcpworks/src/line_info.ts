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

  constructor() {
    this._textOriginal = '';
    this._level = 0;
    this._type = new LineTypeFormat();
    this._textTypeless = '';
    this._InOutData = null;
    this._textTypeIOless = '';
  }

  setTextOrg(text: string): LineInfo {
    this._textOriginal = text;
    return this;
  }

  updateLineLevel(): LineInfo {
    this._level = LineLevel.getLineLevel(this._textOriginal);
    return this;
  }

  updateLineType(): LineInfo {
    [this._type, this._textTypeless] = LineType.get_line_type(this._textOriginal);
    return this;
  }

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
}
