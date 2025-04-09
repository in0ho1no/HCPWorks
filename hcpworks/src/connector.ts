/**
 * 座標を表すインターフェース
 */
export interface Coordinate {
  x: number;
  y: number;
}


/**
 * 線を表すクラス
 */
export class Line {
  start: Coordinate;
  end: Coordinate;

  constructor(start: Coordinate, end: Coordinate) {
    this.start = start;
    this.end = end;
  }

  /**
   * 線の幅を計算する
   * @returns 線の幅
   */
  lineWidth(): number {
    return Math.abs(this.start.x - this.end.x);
  }

  /**
   * 線の高さを計算する
   * @returns 線の高さ
   */
  lineHeight(): number {
    return Math.abs(this.start.y - this.end.y);
  }
}


/**
 * 処理からデータへの接続を表すインターフェース
 */
export class Process2Data {
  exitFromProcess: Line | null;
  betweenProcessData: Line | null;
  enterToData: Line | null;
  color: string;

  constructor() {
    this.exitFromProcess = null;
    this.betweenProcessData = null;
    this.enterToData = null;
    this.color = 'black';
  }
}
