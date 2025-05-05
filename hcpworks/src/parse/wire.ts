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
export class Wire {
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
  wireWidth(): number {
    return Math.abs(this.start.x - this.end.x);
  }

  /**
   * 線の高さを計算する
   * @returns 線の高さ
   */
  wireHeight(): number {
    return Math.abs(this.start.y - this.end.y);
  }
}


/**
 * 処理からデータへの接続を表すインターフェース
 */
export class Process2Data {
  exitFromProcess: Wire | null;
  betweenProcessData: Wire | null;
  enterToData: Wire | null;
  color: string;

  constructor() {
    this.exitFromProcess = null;
    this.betweenProcessData = null;
    this.enterToData = null;
    this.color = '000000';  // black
  }
}
