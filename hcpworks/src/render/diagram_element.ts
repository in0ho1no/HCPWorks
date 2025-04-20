import { LineInfo } from '../parse/line_info';

export class DiagramElement {
  protected _line_info: LineInfo;

  protected _x: number;
  protected _y: number;
  protected _endX: number;

  constructor(line_info: LineInfo) {
    this._line_info = line_info;
    this._x = 0;
    this._y = 0;
    this._endX = 0;
  }

  getX(): number { return this._x; }
  setX(x: number) { this._x = x; }

  getY(): number { return this._y; }
  setY(y: number) { this._y = y; }

  getEndX(): number { return this._endX; }
  setEndX(x: number) { this._endX = x; }

  getLineInfo(): LineInfo { return this._line_info; }
}
