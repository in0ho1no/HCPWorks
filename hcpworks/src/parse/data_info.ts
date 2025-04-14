import { Process2Data } from './wire';

/**
 * データ情報を表すクラス
 */
export class DataInfo {
  name: string;
  connectLine: Process2Data | null;

  constructor(name: string) {
    this.name = name;
    this.connectLine = null;
  }
}

/**
 * 入出力データを表すクラス
 */
export class InOutData {
  private _inDataList: DataInfo[];
  private _outDataList: DataInfo[];

  constructor() {
    this._inDataList = [];
    this._outDataList = [];
  }

  getInDataList(): DataInfo[] { return this._inDataList; }
  setInDataList(dataList: DataInfo[]): InOutData {
    this._inDataList = dataList;
    return this;
  }

  getOutDataList(): DataInfo[] { return this._outDataList; }
  setOutDataList(dataList: DataInfo[]): InOutData {
    this._outDataList = dataList;
    return this;
  }
}
