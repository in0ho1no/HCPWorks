import * as vscode from 'vscode';

/** HCP言語の識別子 */
export const HCP_ID = "hcp";

/** HCPファイルの拡張子 */
export const HCP_SUFFIX = `.${HCP_ID}`;

/**
 * ドキュメントがHCPファイルか判定する
 *
 * 言語IDだけでなくファイル名でも判定するのは、
 * 言語の関連付けが未確定な状態でイベントが届く場合があるため。
 * 拡張子の判定で大小文字を無視するのは、Windows・macOSの既定のファイルシステムが
 * 大小文字を区別せず、`FOO.HCP` を別物として扱う理由が無いため。
 *
 * @param document - 判定対象のドキュメント
 * @returns HCPファイルならtrue
 */
export function isHcpDocument(document: vscode.TextDocument): boolean {
  return document.languageId === HCP_ID
    || document.fileName.toLowerCase().endsWith(HCP_SUFFIX);
}
