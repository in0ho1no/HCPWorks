"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineType = void 0;
const line_define_1 = require("./line_define");
class LineType {
    /**
     * 与えられた行の種別を取得する
     * 想定しない種別の場合はエラーを返す
     * @param line - 種別を取得したい行
     * @returns 行の種別と残りの文字列
     */
    static get_line_type(line) {
        // 空行は無視する
        const strip_line = line.trim();
        if (!strip_line) {
            return [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.NORMAL), line];
        }
        // 行の先頭要素と残りの文字列を保持する
        const parts = strip_line.split(" ");
        const first_elem = parts[0];
        const remainder = parts.length > 1
            ? parts.slice(1).join(" ")
            : "";
        // 種別指定のない行は無視する
        if (!first_elem.startsWith("\\")) {
            return [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.NORMAL), line];
        }
        // 先頭要素と一致した種別を返す
        const line_type_enum = line_define_1.LineTypeDefine.get_type_by_format(first_elem);
        if (line_type_enum) {
            return [line_define_1.LineTypeDefine.get_format_by_type(line_type_enum), remainder];
        }
        // 一致する種別無し
        return [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.NORMAL), line];
    }
}
exports.LineType = LineType;
//# sourceMappingURL=line_type.js.map