import { Wire } from '../parse/wire';
import { DiagramDefine } from './render_define';

/**
 * ワイヤー1本の入力仕様(ジオメトリ計算前)
 */
export interface WireSpec {
  /** 宣言順(0..)。色割り当てとタイブレークの基準 */
  ordinal: number;
  /** \in なら true */
  isInData: boolean;
  /** 処理図形の右端X */
  exitStartX: number;
  /** 処理側水平線のY */
  exitY: number;
  /** 名前が一致した各データ行の水平線Y。空なら未接続 */
  enterYList: number[];
  /** enterYList と対になるデータ行のインデックス */
  enterRowIndexes: number[];
}

/**
 * ルーティング済みワイヤー
 */
export interface RoutedWire {
  spec: WireSpec;
  lane: number;
  color: string;
  /** 処理→レーンの水平線(左→右) */
  exit: Wire;
  /** レーン上の垂直線。未接続ならnull */
  vertical: Wire | null;
  /** レーン→データ左端の水平線(左→右)。終端Xはデータ部配置後に確定する */
  enters: Wire[];
}

/**
 * ジャンプアークが占める水平区間
 */
export interface JumpSpan {
  startX: number;
  endX: number;
}

/**
 * ワイヤーが垂直方向に占有するY区間を求める
 *
 * @param spec ワイヤー仕様
 * @returns [最小Y, 最大Y]。未接続なら [exitY, exitY]
 */
export function wireInterval(spec: WireSpec): [number, number] {
  const ys = [spec.exitY, ...spec.enterYList];
  return [Math.min(...ys), Math.max(...ys)];
}

/**
 * 「より右のレーンに置く」制約を求める
 *
 * ワイヤーAのexit水平線(処理→レーン)とワイヤーBのenter水平線(レーン→データ)が
 * 同一Yになると、BのレーンがAのレーン以下の場合に両線が一直線に重なり、
 * 別ワイヤーが1本の線に見えてしまう。これを防ぐため、
 * exitY(A) が enterYList(B) に含まれるペアに「Bのレーン > Aのレーン」を課す。
 *
 * 自ワイヤーのexitとenterが同一Yになる場合はレーンで直結する正常な形なので対象外。
 *
 * @param specs ワイヤー仕様のリスト
 * @returns ordinal(B) → Bより左に置くべきordinal(A)のリスト
 */
export function computeRightOfConstraints(specs: WireSpec[]): Map<number, number[]> {
  const constraints = new Map<number, number[]>();

  for (const enterSide of specs) {
    const lefts: number[] = [];
    for (const exitSide of specs) {
      if (exitSide.ordinal === enterSide.ordinal) {
        continue;
      }
      if (enterSide.enterYList.includes(exitSide.exitY)) {
        lefts.push(exitSide.ordinal);
      }
    }
    if (lefts.length > 0) {
      constraints.set(enterSide.ordinal, lefts);
    }
  }

  return constraints;
}

/**
 * 左端法(greedy interval coloring)で垂直線のレーンを割り当てる
 *
 * Y区間が clearance 以上離れたワイヤー同士は同一レーンを共有できる。
 * さらに computeRightOfConstraints の制約を満たすよう、exit水平線と
 * 同一Yのenter水平線を持つワイヤーは exit側より右のレーンに割り当てる。
 * 制約が循環する場合も ordinal ベースのフォールバックで決定的に終了する。
 * 安定ソート(minY昇順, maxY昇順, ordinal昇順)とfirst-fitにより決定的な結果を返す。
 *
 * @param specs ワイヤー仕様のリスト
 * @param clearance 同一レーンを共有する区間端点間に必要な間隔
 * @returns ordinal→レーン番号のマップとレーン総数
 */
export function assignLanes(
  specs: WireSpec[],
  clearance: number
): { laneOf: Map<number, number>; laneCount: number } {
  const compareSpecs = (a: WireSpec, b: WireSpec): number => {
    const [aMin, aMax] = wireInterval(a);
    const [bMin, bMax] = wireInterval(b);
    if (aMin !== bMin) { return aMin - bMin; }
    if (aMax !== bMax) { return aMax - bMax; }
    return a.ordinal - b.ordinal;
  };

  const constraints = computeRightOfConstraints(specs);

  // レーンごとの占有Y区間。first-fit判定は区間全走査で行い、割り当て順に依存しない
  const laneIntervals: [number, number][][] = [];
  const laneOf = new Map<number, number>();

  const fitsLane = (lane: [number, number][], minY: number, maxY: number): boolean => {
    return lane.every(([m, M]) => maxY + clearance <= m || M + clearance <= minY);
  };

  const remaining = new Map(specs.map(spec => [spec.ordinal, spec]));
  while (remaining.size > 0) {
    // 左側制約の相手が未割り当てのワイヤーは後回しにする(トポロジカル順)
    const candidates = [...remaining.values()];
    const ready = candidates.filter(spec =>
      (constraints.get(spec.ordinal) ?? []).every(left => !remaining.has(left))
    );
    // 制約が循環している場合は全体から選び、未割り当て相手との制約は無視する
    const pool = ready.length > 0 ? ready : candidates;
    const spec = pool.sort(compareSpecs)[0];

    const [minY, maxY] = wireInterval(spec);
    const assignedLefts = (constraints.get(spec.ordinal) ?? [])
      .filter(left => laneOf.has(left));
    const minLane = assignedLefts.reduce(
      (lane, left) => Math.max(lane, laneOf.get(left)! + 1), 0
    );

    let lane = minLane;
    while (lane < laneIntervals.length && !fitsLane(laneIntervals[lane], minY, maxY)) {
      lane += 1;
    }
    if (lane === laneIntervals.length) {
      laneIntervals.push([]);
    }
    laneIntervals[lane].push([minY, maxY]);
    laneOf.set(spec.ordinal, lane);
    remaining.delete(spec.ordinal);
  }

  return { laneOf, laneCount: laneIntervals.length };
}

/**
 * レーン番号からX座標を求める
 *
 * @param processEndX 処理部の右端X
 * @param lane レーン番号
 * @returns レーンのX座標
 */
export function laneX(processEndX: number, lane: number): number {
  return processEndX + DiagramDefine.IMG_MARGIN + lane * DiagramDefine.LINE_OFFSET;
}

/**
 * レーンを割り当ててワイヤーの exit / vertical / enters 座標を確定する
 *
 * enters の終端Xはデータ部の配置に依存するため仮置き(レーンX)のままとし、
 * 呼び出し側でデータ部配置後に確定させる。
 *
 * @param specs ワイヤー仕様のリスト(ordinal順)
 * @param processEndX 処理部の右端X
 * @param colorTable 線色テーブル
 * @returns ルーティング済みワイヤーと帯域右端X(ワイヤー0本なら0)
 */
export function routeWires(
  specs: WireSpec[],
  processEndX: number,
  colorTable: string[]
): { wires: RoutedWire[]; exitEndX: number } {
  const { laneOf } = assignLanes(specs, DiagramDefine.LANE_CLEARANCE);

  const wires: RoutedWire[] = [];
  let exitEndX = 0;

  for (const spec of specs) {
    const lane = laneOf.get(spec.ordinal)!;
    const x = laneX(processEndX, lane);

    const exit = new Wire(
      { x: spec.exitStartX, y: spec.exitY },
      { x: x, y: spec.exitY }
    );

    let vertical: Wire | null = null;
    if (spec.enterYList.length > 0) {
      const [minY, maxY] = wireInterval(spec);
      vertical = new Wire({ x: x, y: minY }, { x: x, y: maxY });
    }

    const enters = spec.enterYList.map(y => new Wire({ x: x, y: y }, { x: x, y: y }));

    wires.push({
      spec: spec,
      lane: lane,
      color: colorTable[spec.ordinal % colorTable.length],
      exit: exit,
      vertical: vertical,
      enters: enters,
    });
    exitEndX = Math.max(exitEndX, exit.end.x);
  }

  return { wires, exitEndX };
}

/**
 * 水平線が跨ぐ垂直線のX座標をX昇順で返す
 *
 * 端点接触は交差とみなさない(厳密不等号)。これにより自ワイヤーの
 * L字接合や垂直線の端点にちょうど乗る場合はジャンプしない。
 *
 * @param h 水平線 (y, x1 <= x2)
 * @param verticals 垂直線のリスト (x, y1 <= y2)
 * @returns 交差するX座標の昇順リスト(重複なし)
 */
export function computeJumpXs(
  h: { y: number; x1: number; x2: number },
  verticals: { x: number; y1: number; y2: number }[]
): number[] {
  const xs = verticals
    .filter(v => h.x1 < v.x && v.x < h.x2 && v.y1 < h.y && h.y < v.y2)
    .map(v => v.x);
  return [...new Set(xs)].sort((a, b) => a - b);
}

/**
 * 交差X座標のリストをジャンプアーク区間に変換する
 *
 * アーク間の平坦部が minFlat 未満になる近接交差は1つの橋に結合する。
 * 各区間は水平線の範囲 [x1, x2] にクランプされる。
 *
 * @param jumpXs 交差X座標(昇順)
 * @param radius アーク半径
 * @param minFlat アーク間に必要な最小平坦長
 * @param x1 水平線の左端X
 * @param x2 水平線の右端X
 * @returns ジャンプ区間の昇順リスト
 */
export function mergeJumpXs(
  jumpXs: number[],
  radius: number,
  minFlat: number,
  x1: number,
  x2: number
): JumpSpan[] {
  const spans: JumpSpan[] = [];

  for (const x of jumpXs) {
    const startX = x - radius;
    const endX = x + radius;

    const lastSpan = spans[spans.length - 1];
    if (lastSpan !== undefined && startX - lastSpan.endX < minFlat) {
      lastSpan.endX = endX;
    } else {
      spans.push({ startX: startX, endX: endX });
    }
  }

  return spans
    .map(span => ({ startX: Math.max(span.startX, x1), endX: Math.min(span.endX, x2) }))
    .filter(span => span.startX < span.endX);
}
