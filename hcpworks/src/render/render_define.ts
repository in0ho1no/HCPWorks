export class DiagramDefine {
  static readonly DEFAULT_BG_COLOR = "FFFFFF"; // デフォルトの背景色

  static readonly LEVEL_SHIFT = 30;   // レベルの差を表す水平方向のシフト

  static readonly META_LINE_SHIFT = 18;   // メタ情報(Name/scope/kind)の行間。LEVEL_SHIFTより狭くして詰める

  static readonly IMG_MARGIN = 30;    // 画像周辺のマージン

  static readonly LINE_OFFSET = 10;

  static readonly JUMP_RADIUS = 4;      // ワイヤー交差箇所を跨ぐ半円の半径(高さ)
  static readonly JUMP_MIN_FLAT = 3;    // ジャンプアーク間の平坦部がこの長さ未満なら1つの橋に結合する
  static readonly LANE_CLEARANCE = 10;  // 同一レーンを共有する垂直線同士に必要なY方向の間隔

  static readonly WIRE_COLOR_TABLE = [
    "000000", // black
    "FF0000", // red
    "00FF00", // green
    "0000FF", // blue
    "FFFF00", // yellow
    "800080", // purple
    "FFA500", // orange
    "40E0D0", // turquoise
  ];
}
