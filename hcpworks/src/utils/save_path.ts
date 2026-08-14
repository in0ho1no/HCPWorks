import * as path from 'path';

/**
 * プレビュー保存先の、拡張子を除いたパスを組み立てる
 *
 * 元ファイルと同じディレクトリに `<ファイル名>_<モジュール名>` の形で保存する。
 * ディレクトリ部とファイル名部を分けて扱うことで、
 * パス途中のドット(`my.project/`)やファイル名中のドット(`foo.v2.hcp`)を
 * 拡張子と誤認しないようにする。
 *
 * @param sourceFilePath - 元の .hcp ファイルパス
 * @param moduleName - プレビュー対象のモジュール名
 * @returns 拡張子を付与する前の保存先パス
 */
export function buildSavePathBase(sourceFilePath: string, moduleName: string): string {
  const dirName = path.dirname(sourceFilePath);
  const baseName = path.basename(sourceFilePath, path.extname(sourceFilePath));
  return path.join(dirName, `${baseName}_${moduleName}`);
}
