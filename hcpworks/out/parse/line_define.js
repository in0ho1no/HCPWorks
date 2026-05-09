"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineTypeDefine = exports.LineTypeEnum = exports.LineTypeFormat = void 0;
/**
 * 行の種別とその形式を表す
 */
class LineTypeFormat {
    type_value;
    type_format;
    constructor(type_value = 0, type_format = "") {
        this.type_value = type_value;
        this.type_format = type_format;
    }
}
exports.LineTypeFormat = LineTypeFormat;
/**
 * 行の種別を表す列挙型
 */
var LineTypeEnum;
(function (LineTypeEnum) {
    LineTypeEnum[LineTypeEnum["NORMAL"] = 0] = "NORMAL";
    LineTypeEnum[LineTypeEnum["FORK"] = 1] = "FORK";
    LineTypeEnum[LineTypeEnum["REPEAT"] = 2] = "REPEAT";
    LineTypeEnum[LineTypeEnum["MOD"] = 3] = "MOD";
    LineTypeEnum[LineTypeEnum["RETURN"] = 4] = "RETURN";
    LineTypeEnum[LineTypeEnum["TRUE"] = 5] = "TRUE";
    LineTypeEnum[LineTypeEnum["FALSE"] = 6] = "FALSE";
    LineTypeEnum[LineTypeEnum["BRANCH"] = 7] = "BRANCH";
    LineTypeEnum[LineTypeEnum["DATA"] = 8] = "DATA";
    LineTypeEnum[LineTypeEnum["MODULE"] = 9] = "MODULE";
})(LineTypeEnum || (exports.LineTypeEnum = LineTypeEnum = {}));
/**
 * 行の種別定義を管理する
 */
class LineTypeDefine {
    // 種別と形式のマッピング
    static TYPE_FORMATS = {
        [LineTypeEnum.NORMAL]: new LineTypeFormat(0, ""),
        [LineTypeEnum.FORK]: new LineTypeFormat(1, "\\fork"),
        [LineTypeEnum.REPEAT]: new LineTypeFormat(2, "\\repeat"),
        [LineTypeEnum.MOD]: new LineTypeFormat(3, "\\mod"),
        [LineTypeEnum.RETURN]: new LineTypeFormat(4, "\\return"),
        [LineTypeEnum.TRUE]: new LineTypeFormat(5, "\\true"),
        [LineTypeEnum.FALSE]: new LineTypeFormat(6, "\\false"),
        [LineTypeEnum.BRANCH]: new LineTypeFormat(7, "\\branch"),
        [LineTypeEnum.DATA]: new LineTypeFormat(8, "\\data"),
        [LineTypeEnum.MODULE]: new LineTypeFormat(9, "\\module"),
    };
    // 形式から種別へのマッピングを構築
    static FORMAT_TO_TYPE = (() => {
        const result = {};
        for (const [enumType, formatObj] of Object.entries(LineTypeDefine.TYPE_FORMATS)) {
            const typeEnum = Number(enumType);
            if (formatObj.type_format) {
                result[formatObj.type_format] = typeEnum;
            }
        }
        return result;
    })();
    /**
     * 種別に対応する形式情報を取得する
     * @param type_enum - 種別の列挙値
     * @returns 対応する形式情報
     */
    static get_format_by_type(type_enum) {
        return this.TYPE_FORMATS[type_enum];
    }
    /**
     * 形式文字列に対応する種別を取得する
     * NORMALは種別を特定しようがないのでundefinedを返す(初回構築時にマッピングに含めていない)
     * @param format_str 形式文字列
     * @returns 対応する種別、存在しない場合はundefined
     */
    static get_type_by_format(format_str) {
        return this.FORMAT_TO_TYPE[format_str];
    }
}
exports.LineTypeDefine = LineTypeDefine;
//# sourceMappingURL=line_define.js.map