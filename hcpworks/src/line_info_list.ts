import { LineInfo } from './line_info';
import { LineTypeDefine, LineTypeEnum } from './line_define';
import { LineLevel } from './line_level';


export class LineProcessor {
  private _lineInfoList: LineInfo[];
  private _minLevel: number;

  constructor() {
    this._lineInfoList = [];
    this._minLevel = 0;
  }

  /**
   * 処理部の情報をリストにする
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public createProcessInfoList(lineInfoList: LineInfo[]): LineProcessor {
    const processInfoList = [];
    for (const lineInfo of lineInfoList) {
      if (lineInfo.getType().type_value !== LineTypeDefine.get_format_by_type(LineTypeEnum.DATA).type_value) {
        processInfoList.push(lineInfo);
      }
    }
    this._lineInfoList = processInfoList;
    return this;
  }

  /**
   * データ部の情報をリストにする
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public createDataInfoList(lineInfoList: LineInfo[]): LineProcessor {
    const dataInfoList = [];
    for (const line_info of lineInfoList) {
      if (line_info.getType().type_value === LineTypeDefine.get_format_by_type(LineTypeEnum.DATA).type_value) {
        dataInfoList.push(line_info);
      }
    }
    this._lineInfoList = dataInfoList;
    return this;
  }

  /**
   * 行番号を設定する
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public setInfoListNo(): LineProcessor {
    // forEachを使用して各要素に処理を適用
    this._lineInfoList.forEach((lineInfo, index) => {
      lineInfo.setLineNo(index);
    });
    return this;
  }

  /**
   * 各行のレベルに応じた前後関係を決定する
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public assignLineRelationships(): LineProcessor {
    // 昇順で前後関係を決める
    for (let currentIndex = 0; currentIndex < this._lineInfoList.length; currentIndex++) {
      const currentLine = this._lineInfoList[currentIndex];
      const currentLevel = currentLine.getLevel();

      // 同じレベルで1つ前の番号を見つけるために降順で探索
      for (let searchIndex = currentIndex - 1; searchIndex >= 0; searchIndex--) {
        const searchLine = this._lineInfoList[searchIndex];
        const searchLevel = searchLine.getLevel();

        if (searchLevel === currentLevel) {
          // 1つ前の番号を保持する
          currentLine.setBeforeLineNo(searchLine.getLineNo());
          // 同時に次の番号として保存する
          searchLine.setNextLineNo(currentLine.getLineNo());
          break;
        } else if (searchLevel < currentLevel) {
          // 自身よりレベルが小さい行を跨いで接続することはない
          break;
        } else {
          // 自身よりレベルが高い行は跨いで接続することがあるので探索を続ける
        }
      }
    }
    return this;
  }

  /**
   * リストから重複した要素を除外する
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public removeDuplicate(): LineProcessor {
    const removedDuplicateList: LineInfo[] = [];
    const checkedTextList: string[] = [];

    for (const lineInfo of this._lineInfoList) {
      // 未登録の名前だけを新規リストへ登録する
      const checkText = lineInfo.getTextLessTypeIO();
      if (!checkedTextList.includes(checkText)) {
        removedDuplicateList.push(lineInfo);
        checkedTextList.push(checkText);
      }
    }

    this._lineInfoList = removedDuplicateList;
    return this;
  }

  /**
   * リスト内の最小レベルを取得する
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public setMinLevel(): LineProcessor {
    let minLevel: number = LineLevel.LEVEL_MAX;

    for (const lineInfo of this._lineInfoList) {
      minLevel = Math.min(minLevel, lineInfo.getLevel());
    }

    this._minLevel = minLevel;
    return this;
  }
}
