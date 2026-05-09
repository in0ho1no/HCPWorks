"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManager = void 0;
const fs = __importStar(require("fs"));
const Encoding = __importStar(require("encoding-japanese"));
const vscode = __importStar(require("vscode"));
/**
 * ファイル操作を管理する
 */
class FileManager {
    /**
     * ファイルをUTF-8で読み込む
     *
     * 生データを取得するためにファイルパスから直接読み出す
     *
     * @param filePath - ファイルパス
     * @returns - UTF-8に変換された文字列
     */
    convertFileContent(filePath) {
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
    saveSvgToFile(filePath, svgContent) {
        fs.writeFile(filePath, svgContent, (err) => {
            if (err) {
                vscode.window.showErrorMessage(`Failed to save preview: ${err.message}`);
            }
            else {
                vscode.window.showInformationMessage(`Preview saved to ${filePath}`);
            }
        });
    }
}
exports.FileManager = FileManager;
//# sourceMappingURL=file_manager.js.map