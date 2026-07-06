export class DiagramDefine {
  static readonly DEFAULT_BG_COLOR = "FFFFFF"; // デフォルトの背景色

  static readonly LEVEL_SHIFT = 30;   // レベルの差を表す水平方向のシフト

  static readonly META_LINE_SHIFT = 18;   // メタ情報(Name/scope/kind)の行間。LEVEL_SHIFTより狭くして詰める

  static readonly IMG_MARGIN = 30;    // 画像周辺のマージン

  static readonly LINE_OFFSET = 10;

  static readonly JUMP_RADIUS = 4;      // ワイヤー交差箇所を跨ぐ半円の半径(高さ)
  static readonly JUMP_MIN_FLAT = 3;    // ジャンプアーク間の平坦部がこの長さ未満なら1つの橋に結合する
  static readonly LANE_CLEARANCE = 10;  // 同一レーンを共有する垂直線同士に必要なY方向の間隔

  // Okabe-Ito配色ベース。構造線の黒と衝突する色・白背景で視認しにくい色を避け、
  // 隣り合う宣言順(=隣接レーン)の色相が離れるよう並べている
  static readonly WIRE_COLOR_TABLE = [
    "0072B2", // blue
    "D55E00", // vermillion
    "009E73", // bluish green
    "CC79A7", // reddish purple
    "E69F00", // amber
    "800080", // purple
    "56B4E9", // sky blue
    "008B8B", // teal
  ];
}
