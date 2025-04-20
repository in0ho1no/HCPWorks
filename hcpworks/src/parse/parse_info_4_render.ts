import { ProcessLineProcessor } from './line_info_list_process';
import { DataLineProcessor } from './line_info_list_data';
import { LineInfo, createCommonDataInfo } from './line_info';

/**
 * レンダー向けのパース情報
 */
export class ParseInfo4Render {
  private _processLines: ProcessLineProcessor;
  private _dataLines: DataLineProcessor;

  constructor(processLines: ProcessLineProcessor, dataLines: DataLineProcessor) {
    this._processLines = processLines;
    this._dataLines = dataLines;
  }

  /**
   * 処理部のin/outからdataの情報リストを作成する
   * 
   * @returns 作成したdataの情報リスト
   */
  private __createIoDataLineInfoList(): LineInfo[] {
    const ioDataInfoList: LineInfo[] = [];
    for (const lineInfo of this._processLines.getLineInfoList()) {
      const inOutData = lineInfo.getInOutData();
      const dataMinLevel = this._dataLines.getMinLevel();

      // \in を \data情報化
      for (const inData of inOutData.getInDataList()) {
        const inDataInfo = createCommonDataInfo(inData.name, dataMinLevel);
        ioDataInfoList.push(inDataInfo);
      }

      // \out を \data情報化
      for (const outData of inOutData.getOutDataList()) {
        const outDataInfo = createCommonDataInfo(outData.name, dataMinLevel);
        ioDataInfoList.push(outDataInfo);
      }
    }

    return ioDataInfoList;
  }

  /**
   * 処理部から抽出した入出力データをデータ部のリストへ追加する
   * 
   * @param ioDataList 入出力データのリスト
   */
  private __appendIoData(ioDataList: LineInfo[]): void {
    for (const ioData of ioDataList) {
      // 保持済みのリストから名前だけのリストを用意する
      const infoNameList = this._dataLines.getLineInfoList().map(lineInfo => lineInfo.getTextLessTypeIO());

      // 未保持ならリストへ追加する
      if (!infoNameList.includes(ioData.getTextLessTypeIO())) {
        this._dataLines.getLineInfoList().push(ioData);
      }
    }
  }

  /**
   * 処理部のみに記載されたin/outをdata部の情報として追加する
   */
  mergeIoData(): void {
    const ioDataInfoList = this.__createIoDataLineInfoList();
    this.__appendIoData(ioDataInfoList);
  }

  getProcessLines() { return this._processLines; }
  getDataLines() { return this._dataLines; }
}
