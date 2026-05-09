"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessLineProcessor = void 0;
const line_define_1 = require("./line_define");
const line_info_list_base_1 = require("./line_info_list_base");
/**
 * 処理部の情報を扱う
 */
class ProcessLineProcessor extends line_info_list_base_1.BaseLineProcessor {
    /**
     * 処理部の情報リストを作成する
     * @param lineInfoList 処理対象のラインリスト
     * @returns このインスタンスへの参照（メソッドチェーン用）
     */
    createInfoList(lineInfoList) {
        const processInfoList = lineInfoList.filter(lineInfo => lineInfo.getType().type_value !== line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.DATA).type_value);
        super.setLineInfoList(processInfoList);
        return this;
    }
    /**
     * レベルを制限したリストを作成する
     * @param limitLevel 制限するレベル
     * @returns このインスタンスへの参照（メソッドチェーン用）
     */
    limitLevelInfoList(limitLevel) {
        const levelLimitInfoList = this.getLineInfoList().filter(lineInfo => lineInfo.getLevel() <= limitLevel);
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
    static process(lineInfoList, limitLevel) {
        return new ProcessLineProcessor()
            .createInfoList(lineInfoList)
            .limitLevelInfoList(limitLevel)
            .setInfoListNo()
            .assignLineRelationships()
            .setMinLevel();
    }
}
exports.ProcessLineProcessor = ProcessLineProcessor;
//# sourceMappingURL=line_info_list_process.js.map