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

  /**
   * 画像をファイルに保存する
   *
   * Webviewから受け取ったdata URL(`data:image/<形式>;base64,...`)をデコードして書き込む。
   * PNG/JPEG/WebPなど、形式を問わず扱える。
   *
   * @param filePath - 保存先のファイルパス
   * @param dataUrl - 画像のdata URL文字列
   */
  public saveImageToFile(filePath: string, dataUrl: string): void {
    // data URLのプレフィックスを除去してbase64部分のみを取り出す
    const base64Data = dataUrl.replace(/^data:image\/[a-z+.-]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        vscode.window.showErrorMessage(`Failed to save preview: ${err.message}`);
      } else {
        vscode.window.showInformationMessage(`Preview saved to ${filePath}`);
      }
    });
  }
}
