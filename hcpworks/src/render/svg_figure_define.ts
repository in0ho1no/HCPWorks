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
   * 文字幅をpx換算する際の、フォントサイズに対する1文字あたりの送り幅の比率。
   * 描画フォント(Consolas等のmonospace)の実測値に合わせる。
   * - 全角文字: 約1.0em
   * - 半角文字: Consolasの送り幅は約0.55emだが、矢印との重なりを避けるため
   *   わずかに余裕を持たせた値とする。
   */
  static readonly FULL_WIDTH_CHAR_RATIO = 1.0;
  static readonly HALF_WIDTH_CHAR_RATIO = 0.6;
}
