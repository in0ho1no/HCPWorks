import { LineTypeFormat, LineTypeEnum, LineTypeDefine } from './line_define';

const SUPPLEMENT_OPEN_BRACKETS = ["(", "（"];
const SUPPLEMENT_CLOSE_BRACKETS = [")", "）"];

/** テキストが補足情報の括弧パターン（全体が丸括弧で囲まれているか）を満たすか判定する */
function isSupplementText(text: string): boolean {
  const trimmed = text.trim();
  return SUPPLEMENT_OPEN_BRACKETS.some(b => trimmed.startsWith(b))
    && SUPPLEMENT_CLOSE_BRACKETS.some(b => trimmed.endsWith(b));
}

export class LineType {
  /**
   * 与えられた行の種別を取得する
   * 想定しない種別の場合はエラーを返す
   * @param line - 種別を取得したい行
   * @returns 行の種別と残りの文字列
   */
  public static get_line_type(line: string): [LineTypeFormat, string] {
    // 空行は無視する
    const strip_line = line.trim();
    if (!strip_line) {
      return [LineTypeDefine.get_format_by_type(LineTypeEnum.NORMAL), line];
    }

    // 行の先頭要素と残りの文字列を保持する
    const parts = strip_line.split(" ");
    const first_elem = parts[0];
    const remainder = parts.length > 1
      ? parts.slice(1).join(" ")
      : "";

    // 種別指定のない行は無視する
    if (!first_elem.startsWith("\\")) {
      return [LineTypeDefine.get_format_by_type(LineTypeEnum.NORMAL), line];
    }

    // 先頭要素と一致した種別を返す
    const line_type_enum = LineTypeDefine.get_type_by_format(first_elem);
    if (line_type_enum) {
      // \data (...) の場合は DATA_SUPPLEMENT として扱う
      if (line_type_enum === LineTypeEnum.DATA && isSupplementText(remainder)) {
        return [LineTypeDefine.get_format_by_type(LineTypeEnum.DATA_SUPPLEMENT), remainder];
      }
      return [LineTypeDefine.get_format_by_type(line_type_enum), remainder];
    }

    // 一致する種別無し
    return [LineTypeDefine.get_format_by_type(LineTypeEnum.NORMAL), line];
  }
}
