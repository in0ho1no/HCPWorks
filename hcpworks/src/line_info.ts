import { NONAME } from 'dns';
import { LineLevel } from './line_level';
import { LineType } from './line_type';
import { LineTypeFormat } from './line_define';

export class LineInfo {
  static readonly DEFAULT_VALUE = -1;

  private _textOriginal: string;
  private _level: number;
  private _type: LineTypeFormat;
  private _textTypeless: string;

  constructor() {
    this._textOriginal = '';
    this._level = 0;
    this._type = new LineTypeFormat();
    this._textTypeless = '';
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

}
