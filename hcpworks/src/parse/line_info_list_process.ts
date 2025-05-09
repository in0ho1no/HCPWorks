import { LineInfo } from './line_info';
import { LineTypeDefine, LineTypeEnum } from './line_define';
import { BaseLineProcessor } from './line_info_list_base';

/**
 * 処理部の情報を扱う
 */
export class ProcessLineProcessor extends BaseLineProcessor {
  /**
   * 処理部の情報リストを作成する
   * @param lineInfoList 処理対象のラインリスト
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public override createInfoList(lineInfoList: LineInfo[]): ProcessLineProcessor {
    const processInfoList = lineInfoList.filter(lineInfo =>
      lineInfo.getType().type_value !== LineTypeDefine.get_format_by_type(LineTypeEnum.DATA).type_value
    );

    super.setLineInfoList(processInfoList);
    return this;
  }

  /**
   * レベルを制限したリストを作成する
   * @param limitLevel 制限するレベル
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public override limitLevelInfoList(limitLevel: number) {
    const levelLimitInfoList = this.getLineInfoList().filter(lineInfo =>
      lineInfo.getLevel() <= limitLevel
    );

    super.setLineInfoList(levelLimitInfoList);
    return this;
  }

  /**
   * 処理部の標準的な処理シーケンスを実行する
   * 1. 行番号を設定
   * 2. 行間の関係を割り当て
   * 3. 最小レベルを設定
   * @param lineInfoList 処理対象のラインリスト
   * @returns このインスタンスへの参照
   */
  public static process(lineInfoList: LineInfo[], limitLevel: number): ProcessLineProcessor {
    return new ProcessLineProcessor()
      .createInfoList(lineInfoList)
      .limitLevelInfoList(limitLevel)
      .setInfoListNo()
      .assignLineRelationships()
      .setMinLevel();
  }
}
