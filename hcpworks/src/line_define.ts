/**
 * 行の種別とその形式を表す
 */
export class LineTypeFormat {
  public type_value: number;
  public type_format: string;

  constructor(type_value: number = 0, type_format: string = "") {
    this.type_value = type_value;
    this.type_format = type_format;
  }
}

/**
 * 行の種別を表す列挙型
 */
export enum LineTypeEnum {
  NORMAL = 1,
  FORK,
  REPEAT,
  MOD,
  RETURN,
  TRUE,
  FALSE,
  BRANCH,
  DATA,
  MODULE
}

/**
 * 行の種別定義を管理する
 */
export class LineTypeDefine {
  // 種別と形式のマッピング
  private static TYPE_FORMATS: Record<LineTypeEnum, LineTypeFormat> = {
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
  private static FORMAT_TO_TYPE: Record<string, LineTypeEnum> = (() => {
    const result: Record<string, LineTypeEnum> = {};
    for (const [enumType, formatObj] of Object.entries(LineTypeDefine.TYPE_FORMATS)) {
      const typeEnum = Number(enumType) as LineTypeEnum;
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
  public static get_format_by_type(type_enum: LineTypeEnum): LineTypeFormat {
    return this.TYPE_FORMATS[type_enum];
  }

  /**
   * 形式文字列に対応する種別を取得する
   * NORMALは種別を特定しようがないのでundefinedを返す(初回構築時にマッピングに含めていない)
   * @param format_str 形式文字列
   * @returns 対応する種別、存在しない場合はundefined
   */
  public static get_type_by_format(format_str: string): LineTypeEnum | undefined {
    return this.FORMAT_TO_TYPE[format_str];
  }
}
