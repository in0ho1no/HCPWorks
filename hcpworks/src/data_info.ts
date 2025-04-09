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
  inDataList: DataInfo[];
  outDataList: DataInfo[];

  constructor(inDataList: DataInfo[], outDataList: DataInfo[]) {
    this.inDataList = inDataList;
    this.outDataList = outDataList;
  }
}
