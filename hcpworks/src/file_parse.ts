/**
 * モジュール定義のプレフィックス
 * モジュール開始行を識別するために使用する文字列
 */
const MODULE_PREFIX = '\\module ';

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
 * - 空行
 * @param textLines - 変換元のテキストデータ配列
 * @returns 不要な情報を除いたテキストデータ配列
 */
export function cleanTextLines(textLines: string[]): string[] {
  const cleanedLines: string[] = [];

  for (const text of textLines) {
    // コメントを削除する
    const uncommentedLine = text.split("#")[0];

    // 空行を無視する
    // 保持する行は、行頭のタブ・空白を残す必要があるのでtrimした文字列は再利用しない
    if (uncommentedLine.trim().length === 0) {
      continue;
    }

    // 残った文字列をリストに追加する
    cleanedLines.push(uncommentedLine);
  }

  return cleanedLines;
}
