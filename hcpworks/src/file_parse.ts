const MODULE_PREFIX = '\\module ';

export interface Module {
  name: string;
  content: string[];
}

export function parseModules(fileContent: string): Module[] {
  const lines = fileContent.split('\n');
  const modules: Module[] = [];
  
  let currentModule: Module | null = null;
  let lineIndex = 0;
  
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    
    // モジュール開始行を検出
    if (line.trim().startsWith(MODULE_PREFIX)) {
      // 前のモジュールが存在する場合は配列に追加
      if (currentModule !== null) {
        modules.push(currentModule);
      }
      
      // モジュール名を抽出
      const moduleName = line.trim().substring(MODULE_PREFIX.length);
      
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
        // MODULE_PREFIXを保持する前に現れた文字列
      }
    }
    
    lineIndex++;
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
 * @param textLines 変換元のテキストデータ
 * @returns 不要な情報を除いたテキストデータ
 */
export function cleanTextLines(textLines:string[]): string[] {
  const cleanedLines: string[] = [];

  for (const text of textLines) {
    // コメントを削除する
    const uncommentedLine = text.split("#")[0];

    // 空行を無視する
    if (uncommentedLine.trim().length === 0) {
      continue;
    }

    // 残った文字列をリストに追加する
    cleanedLines.push(uncommentedLine);
  }

  return cleanedLines;
}
