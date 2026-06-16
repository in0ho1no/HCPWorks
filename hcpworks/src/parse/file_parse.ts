import { LineLevel } from './line_level';

/**
 * モジュール定義のプレフィックス
 * モジュール開始行を識別するために使用する文字列
 */
const MODULE_PREFIX = '\\module ';

/**
 * 表定義のマーカー
 * 表ブロックの開始行を識別するために使用する文字列
 */
const TABLE_MARKER = '\\table';

/**
 * データ定義のマーカー
 * データ部の開始行を識別するために使用する文字列(表ブロックの終端に用いる)
 */
const DATA_MARKER = '\\data';

/**
 * モジュール情報を表すインターフェース
 */
export interface Module {
  /** モジュールの名前 */
  name: string;

  /** モジュールの内容を表す行の配列 */
  content: string[];
}

/**
 * ファイルコンテンツからモジュール情報を解析する
 * 
 * @param fileContent - 解析するファイルの内容
 * @returns 抽出されたモジュールの配列
 */
export function parseModules(fileContent: string): Module[] {
  const lines = fileContent.split('\n');
  const modules: Module[] = [];

  let currentModule: Module | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // モジュール開始行を検出
    if (trimmedLine.startsWith(MODULE_PREFIX)) {
      // 前のモジュールが存在する場合は配列に追加
      if (currentModule !== null) {
        modules.push(currentModule);
      }

      // モジュール名を抽出
      // 「\module  xxx」 のようなケースを想定して再度trimしておく
      const moduleName = trimmedLine.substring(MODULE_PREFIX.length).trim();

      // 新しいモジュールを作成
      currentModule = {
        name: moduleName,
        content: []
      };

    } else {
      if (currentModule !== null) {
        // 現在のモジュールにコンテンツを追加
        currentModule.content.push(line);
      } else {
        // MODULE_PREFIXを保持する前に現れた文字列は無視する
      }
    }
  }

  // 最後のモジュールを追加
  if (currentModule !== null) {
    modules.push(currentModule);
  }

  return modules;
}

/**
 * テキストデータから不要な情報を除去する
 * 
 * 以下取り除く
 * - コメント("#"に続く文字列)
 * - 丸括弧で囲まれたテキスト行（半角/全角の開始括弧で始まり、半角/全角の終了括弧で終わる行）
 * - 空行
 * @param textLines - 変換元のテキストデータ配列
 * @returns 不要な情報を除いたテキストデータ配列
 */
export function cleanTextLines(textLines: string[]): string[] {
  const cleanedLines: string[] = [];

  // 開始括弧と終了括弧のパターン
  const openBrackets = ["(", "（"];
  const closeBrackets = [")", "）"];

  for (const text of textLines) {
    // コメントを削除する
    const uncommentedLine = text.split("#")[0];

    // trimした文字列(判定用(保持する行は、行頭のタブ・空白を残す必要があるのでtrimした文字列は再利用しない))
    const trimmedLine = uncommentedLine.trim();

    // 空行を無視する
    if (trimmedLine.length === 0) {
      continue;
    }

    // 開始括弧で始まり、終了括弧で終わる行を無視する
    const startsWithOpenBracket = openBrackets.some(bracket => trimmedLine.startsWith(bracket));
    const endsWithCloseBracket = closeBrackets.some(bracket => trimmedLine.endsWith(bracket));
    if (startsWithOpenBracket && endsWithCloseBracket) {
      continue;
    }

    // 残った文字列をリストに追加する
    cleanedLines.push(uncommentedLine);
  }

  return cleanedLines;
}

/**
 * 表の1行を表すインターフェース
 */
export interface TableRow {
  /** 行のセル(連続カンマは集約済み) */
  cells: string[];

  /** 行頭インデントによる階層(0が最上位)。構造体メンバの親子関係を表す */
  depth: number;
}

/**
 * 表ブロックを表すインターフェース
 */
export interface TableData {
  /** 表のキャプション(\table に続く文字列。無指定なら空文字) */
  caption: string;

  /** 表の行データ。先頭行をヘッダーとして扱う */
  rows: TableRow[];
}

/**
 * 1行をセルの配列へ変換する
 *
 * カンマで分割し、各セルの前後空白を除去したうえで空セルを取り除く。
 * これにより連続したカンマは1つの区切りとみなされる。
 * 例: "a,,, b,, c" → ["a", "b", "c"]
 *
 * @param line - 変換元の行(コメント除去済みを想定)
 * @returns セルの配列(有効なセルが無ければ空配列)
 */
function parseTableRow(line: string): string[] {
  return line
    .split(",")
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0);
}

/**
 * 行頭インデントから階層(depth)を求める
 *
 * HCPのインデント規則に合わせ、タブ1個または半角4スペースを1階層とみなす。
 * getLineLevel と異なり、半端なインデントでも例外を投げず切り捨てる。
 *
 * @param line - 対象の行(コメント除去済みを想定)
 * @returns 階層(0が最上位)
 */
function getRowDepth(line: string): number {
  const indent = line.match(/^[ \t]*/)?.[0] ?? "";

  // タブを半角スペース換算してから1階層あたりの幅で割る
  let spaceCount = 0;
  for (const char of indent) {
    spaceCount += char === "\t" ? LineLevel.TAB2SPACE : 1;
  }
  return Math.floor(spaceCount / LineLevel.TAB2SPACE);
}

/**
 * 行がモジュール開始行か否かを判定する
 *
 * @param trimmedLine - trim済みの行
 * @returns モジュール開始行ならtrue
 */
function isModuleLine(trimmedLine: string): boolean {
  return trimmedLine.startsWith(MODULE_PREFIX) || trimmedLine === MODULE_PREFIX.trim();
}

/**
 * 行がデータ部の開始行か否かを判定する
 *
 * @param trimmedLine - trim済みの行
 * @returns データ部の開始行ならtrue
 */
function isDataLine(trimmedLine: string): boolean {
  return trimmedLine.startsWith(DATA_MARKER + " ") || trimmedLine === DATA_MARKER;
}

/**
 * 行が表マーカー行か否かを判定し、キャプションを返す
 *
 * @param trimmedLine - trim済みの行
 * @returns 表マーカー行ならキャプション(無指定なら空文字)、そうでなければnull
 */
function getTableCaption(trimmedLine: string): string | null {
  if (trimmedLine === TABLE_MARKER) {
    return "";
  }
  if (trimmedLine.startsWith(TABLE_MARKER + " ")) {
    return trimmedLine.substring(TABLE_MARKER.length).trim();
  }
  return null;
}

/**
 * テキストデータから表ブロックを抽出する
 *
 * \table マーカー行に続く「連続した行」を1つの表とみなす。
 * モジュール内では \module から \data の間に表を置くことを想定し、
 * 表は以下のいずれかで終端する。
 * - 空行
 * - \data 開始行(データ部)
 * - 次の \table マーカー行
 * - \module 開始行
 * - 入力の終端
 *
 * 抽出した表に使われた行は remainingLines から取り除く。
 * 表の終端判定に空行を用いるため、cleanTextLines より前に呼び出すこと。
 *
 * @param textLines - 解析対象のテキストデータ配列
 * @returns 抽出した表の配列と、表以外の残りの行
 */
export function extractTables(textLines: string[]): { tables: TableData[]; remainingLines: string[] } {
  const tables: TableData[] = [];
  const remainingLines: string[] = [];

  let currentTable: TableData | null = null;

  // 収集中の表を確定してリストへ追加する
  const finalizeTable = (): void => {
    if (currentTable !== null) {
      // 有効な行が1つも無ければ表として扱わない
      if (currentTable.rows.length > 0) {
        tables.push(currentTable);
      }
      currentTable = null;
    }
  };

  for (const line of textLines) {
    // コメントを除去して判定する(保持する行も同様に除去後の文字列を使う)
    const uncommentedLine = line.split("#")[0];
    const trimmedLine = uncommentedLine.trim();

    // 表マーカー行を検出したら新しい表を開始する
    const caption = getTableCaption(trimmedLine);
    if (caption !== null) {
      finalizeTable();
      currentTable = { caption, rows: [] };
      continue;
    }

    // 表を収集中の場合
    if (currentTable !== null) {
      // 空行・データ部開始行・モジュール開始行で表を終端する
      if (trimmedLine.length === 0 || isDataLine(trimmedLine) || isModuleLine(trimmedLine)) {
        finalizeTable();
        // 終端要因となった行自体は通常の行として残す
        remainingLines.push(line);
        continue;
      }

      // セルへ分割して行を追加する(有効なセルがあれば)
      const cells = parseTableRow(uncommentedLine);
      if (cells.length > 0) {
        currentTable.rows.push({ cells, depth: getRowDepth(uncommentedLine) });
      }
      continue;
    }

    // 表ブロック外の行はそのまま残す
    remainingLines.push(line);
  }

  // 末尾で収集中の表を確定する
  finalizeTable();

  return { tables, remainingLines };
}
