"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOTypeDefine = exports.IOTypeEnum = exports.IOTypeFormat = void 0;
/**
 * 入出力の種別とその形式を表す
 */
class IOTypeFormat {
    type_value;
    type_format;
    constructor(type_value = 0, type_format = "") {
        this.type_value = type_value;
        this.type_format = type_format;
    }
}
exports.IOTypeFormat = IOTypeFormat;
/**
 * 行の種別を表す列挙型
 */
var IOTypeEnum;
(function (IOTypeEnum) {
    IOTypeEnum[IOTypeEnum["IN"] = 0] = "IN";
    IOTypeEnum[IOTypeEnum["OUT"] = 1] = "OUT";
})(IOTypeEnum || (exports.IOTypeEnum = IOTypeEnum = {}));
/**
 * 行の種別定義を管理する
 */
class IOTypeDefine {
    // 種別と形式のマッピング
    static TYPE_FORMATS = {
        [IOTypeEnum.IN]: new IOTypeFormat(0, "\\in"),
        [IOTypeEnum.OUT]: new IOTypeFormat(1, "\\out"),
    };
    // 形式から種別へのマッピングを構築
    static FORMAT_TO_TYPE = (() => {
        const result = {};
        for (const [enumType, formatObj] of Object.entries(IOTypeDefine.TYPE_FORMATS)) {
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
exports.IOTypeDefine = IOTypeDefine;
//# sourceMappingURL=data_define.js.map