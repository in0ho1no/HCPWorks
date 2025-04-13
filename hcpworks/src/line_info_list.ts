import { LineInfo } from './line_info';
import { LineLevel } from './line_level';

/**
 * LineProcessorの基底クラス
 */
export abstract class BaseLineProcessor {
  protected _lineInfoList: LineInfo[];
  protected _minLevel: number;

  constructor() {
    this._lineInfoList = [];
    this._minLevel = 0;
  }

  /**
   * 情報リストを作成する（サブクラスで実装する）
   * @param lineInfoList 処理対象のラインリスト
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public abstract createInfoList(lineInfoList: LineInfo[]): BaseLineProcessor;

  /**
   * ラインリストを設定する
   * @param lineInfoList 設定するラインリスト
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public setLineInfoList(lineInfoList: LineInfo[]): BaseLineProcessor {
    this._lineInfoList = lineInfoList;
    return this;
  }

  /**
   * 行番号を設定する
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public setInfoListNo(): BaseLineProcessor {
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
  public assignLineRelationships(): BaseLineProcessor {
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
  public removeDuplicate(): BaseLineProcessor {
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
  public setMinLevel(): BaseLineProcessor {
    let minLevel: number = LineLevel.LEVEL_MAX;

    for (const lineInfo of this._lineInfoList) {
      minLevel = Math.min(minLevel, lineInfo.getLevel());
    }

    this._minLevel = minLevel;
    return this;
  }
  public getMinLevel(): number { return this._minLevel; }
}
