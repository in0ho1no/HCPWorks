export class SvgFigureDefine {
  static readonly CIRCLE_R = 9;
  static readonly FIGURE_SPACE = this.CIRCLE_R;
  static readonly FIGURE_WIDTH = this.CIRCLE_R * 2;
  static readonly FIGURE_HEIGHT = this.CIRCLE_R * 2;

  static readonly ARROW_HEAD = 8;
  static readonly SPACE_FIGURE_TO_TEXT = 10;
  static readonly TEXT_MARGIN = 15;
  static readonly FONT_SIZE_PX = 12;
  static readonly LINE_BREAK = "\r\n";

  /**
   * 見え消し(取り消し線)対象の文字列に敷く背景色。
   * サーモンピンク系の薄い色。<del>～</del>で囲った範囲に適用する。
   */
  static readonly STRIKE_BG_COLOR = "#ffc9c4";

  /**
   * 新規追加・変更(<ins>～</ins>)対象の文字列に敷く背景色。
   * ライトグリーン系の薄い色。STRIKE_BG_COLOR と対になる色味。
   */
  static readonly INSERT_BG_COLOR = "#c9ffc4";

  /**
   * 装飾タグの記法エラー時に敷く背景色。
   * <del>/<ins>の入れ子・対応しない閉じタグ・閉じ忘れなどを赤背景で明示する。
   */
  static readonly DECORATION_ERROR_BG_COLOR = "#ff5d5d";

  /**
   * 文字幅をpx換算する際の、フォントサイズに対する1文字あたりの送り幅の比率。
   * 描画フォント(Consolas等のmonospace)の実測値に合わせる。
   * - 全角文字: 約1.0em
   * - 半角文字: Consolasの送り幅は約0.55em。実描画で重なり/余計な隙間が
   *   生じない値として0.54を採用(半角87文字連続でも重なりなしを確認)。
   */
  static readonly FULL_WIDTH_CHAR_RATIO = 1.0;
  static readonly HALF_WIDTH_CHAR_RATIO = 0.54;

  /**
   * 装飾背景(rect)の幅計算に用いる半角文字の送り幅比率。
   * (見え消し<del>・追加<ins>・エラー背景で共通)
   * レイアウト/矢印用の HALF_WIDTH_CHAR_RATIO は重なり防止のため広めに
   * 見積もっているが、塗りつぶしの背景ではその上振れが右端のはみ出しとして
   * 見えてしまう。背景は実描画グリフに寄せるため、やや詰めた値を用いる。
   */
  static readonly DECORATION_BG_HALF_WIDTH_RATIO = 0.53;
}
