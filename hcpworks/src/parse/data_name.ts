/**
 * データ名の比較用キーを返す。
 *
 * 表示装飾タグ(<ins>/<del>)の有無で同一データを区別しないため、
 * 比較時にはタグを除去して前後空白を正規化する。
 */
export function normalizeDataName(name: string): string {
  if (!name) {
    return '';
  }

  return name
    .replace(/<\/?(?:ins|del)>/g, '')
    .trim();
}
