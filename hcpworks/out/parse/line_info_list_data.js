"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataLineProcessor = void 0;
const line_define_1 = require("./line_define");
const line_info_list_base_1 = require("./line_info_list_base");
/**
 * データ部の情報を扱う
 */
class DataLineProcessor extends line_info_list_base_1.BaseLineProcessor {
    /**
     * データ部の情報リストを作成する
     * @param lineInfoList 処理対象のラインリスト
     * @returns このインスタンスへの参照（メソッドチェーン用）
     */
    createInfoList(lineInfoList) {
        const dataInfoList = lineInfoList.filter(lineInfo => lineInfo.getType().type_value === line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.DATA).type_value);
        super.setLineInfoList(dataInfoList);
        return this;
    }
    /**
     * レベルを制限したリストを作成する
     * @param limitLevel 制限するレベル
     * @returns このインスタンスへの参照（メソッドチェーン用）
     */
    limitLevelInfoList(limitLevel) {
        // データ部ではレベル制限は行わない
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
    static process(lineInfoList) {
        return new DataLineProcessor()
            .createInfoList(lineInfoList)
            .setInfoListNo()
            .removeDuplicate()
            .assignLineRelationships()
            .setMinLevel();
    }
}
exports.DataLineProcessor = DataLineProcessor;
//# sourceMappingURL=line_info_list_data.js.map