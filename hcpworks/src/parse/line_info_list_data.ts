import { LineInfo } from './line_info';
import { LineTypeDefine, LineTypeEnum } from './line_define';
import { BaseLineProcessor } from './line_info_list_base';

/**
 * データ部の情報を扱う
 */
export class DataLineProcessor extends BaseLineProcessor {
  /**
   * データ部の情報リストを作成する
   * @param lineInfoList 処理対象のラインリスト
   * @returns このインスタンスへの参照（メソッドチェーン用）
   */
  public override createInfoList(lineInfoList: LineInfo[]): DataLineProcessor {
    const dataInfoList = lineInfoList.filter(lineInfo =>
      lineInfo.getType().type_value === LineTypeDefine.get_format_by_type(LineTypeEnum.DATA).type_value
    );

    super.setLineInfoList(dataInfoList);
    return this;
  }

  /**
   * データ部の標準的な処理シーケンスを実行する
   * 1. 行番号を設定
   * 2. 重複を除去
   * 3. 行間の関係を割り当て
   * 4. 最小レベルを設定
   * @param lineInfoList 処理対象のラインリスト
   * @returns このインスタンスへの参照
   */
  public static process(lineInfoList: LineInfo[]): DataLineProcessor {
    return new DataLineProcessor()
      .createInfoList(lineInfoList)
      .setInfoListNo()
      .removeDuplicate()
      .assignLineRelationships()
      .setMinLevel();
  }
}