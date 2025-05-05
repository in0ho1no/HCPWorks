import * as fs from 'fs';
import * as Encoding from 'encoding-japanese';
import * as vscode from 'vscode';

/**
 * ファイル操作を管理する
 */
export class FileManager {

  /**
   * ファイルをUTF-8で読み込む
   * 
   * 生データを取得するためにファイルパスから直接読み出す
   * 
   * @param filePath - ファイルパス
   * @returns - UTF-8に変換された文字列
   */
  public convertFileContent(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);

    // 文字コードを自動検出
    const detectedEncoding = Encoding.detect(fileBuffer);
    const encodingToUse = detectedEncoding && detectedEncoding !== 'BINARY' ? detectedEncoding : 'SJIS';

    // 文字コード変換
    const unicodeArray = Encoding.convert(fileBuffer, {
      to: 'UNICODE',
      from: encodingToUse,
      type: 'array'
    });

    // UnicodeArrayを文字列に変換
    const decodedContent = Encoding.codeToString(unicodeArray);

    // 改行コードを統一
    const unifiedContent = decodedContent.replace(/\r\n/g, '\n');
    return unifiedContent;
  }

  /**
   * SVGをファイルに保存する
   */
  public saveSvgToFile(filePath: string, svgContent: string): void {
    fs.writeFile(filePath, svgContent, (err) => {
      if (err) {
        vscode.window.showErrorMessage(`Failed to save preview: ${err.message}`);
      } else {
        vscode.window.showInformationMessage(`Preview saved to ${filePath}`);
      }
    });
  }
}
