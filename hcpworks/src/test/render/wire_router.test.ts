import * as assert from 'assert';
import {
  WireSpec,
  wireInterval,
  assignLanes,
  laneX,
  routeWires,
  computeJumpXs,
  mergeJumpXs,
} from '../../render/wire_router';
import { DiagramDefine } from '../../render/render_define';

function makeSpec(
  ordinal: number,
  exitY: number,
  enterYList: number[],
  isInData: boolean = false
): WireSpec {
  return {
    ordinal: ordinal,
    isInData: isInData,
    exitStartX: 100,
    exitY: exitY,
    enterYList: enterYList,
    enterRowIndexes: enterYList.map((_, i) => i),
  };
}

suite('WireRouter - wireInterval', () => {
  test('should span exitY and all enterYs', () => {
    const spec = makeSpec(0, 50, [30, 90]);
    assert.deepStrictEqual(wireInterval(spec), [30, 90]);
  });

  test('should collapse to exitY when no enters', () => {
    const spec = makeSpec(0, 50, []);
    assert.deepStrictEqual(wireInterval(spec), [50, 50]);
  });
});

suite('WireRouter - assignLanes', () => {
  test('should assign different lanes to overlapping intervals', () => {
    const specs = [
      makeSpec(0, 10, [100]),
      makeSpec(1, 50, [150]),
    ];
    const { laneOf, laneCount } = assignLanes(specs, 10);

    assert.strictEqual(laneCount, 2);
    assert.notStrictEqual(laneOf.get(0), laneOf.get(1));
  });

  test('should share a lane for intervals separated by clearance or more', () => {
    const specs = [
      makeSpec(0, 10, [40]),
      makeSpec(1, 60, [90]),  // 40 + 10 <= 60
    ];
    const { laneOf, laneCount } = assignLanes(specs, 10);

    assert.strictEqual(laneCount, 1);
    assert.strictEqual(laneOf.get(0), laneOf.get(1));
  });

  test('should respect clearance boundary (gap 10 shares, gap 9 does not)', () => {
    const shared = assignLanes([makeSpec(0, 10, [40]), makeSpec(1, 50, [80])], 10);
    assert.strictEqual(shared.laneCount, 1, 'gap of exactly clearance should share a lane');

    const separated = assignLanes([makeSpec(0, 10, [40]), makeSpec(1, 49, [80])], 10);
    assert.strictEqual(separated.laneCount, 2, 'gap below clearance should use separate lanes');
  });

  test('should use lane count equal to maximum simultaneous overlap', () => {
    // 3本が重なる区間を含む5本(最大同時重なりは3)
    const specs = [
      makeSpec(0, 0, [100]),
      makeSpec(1, 30, [130]),
      makeSpec(2, 60, [160]),
      makeSpec(3, 200, [300]),
      makeSpec(4, 230, [330]),
    ];
    const { laneCount } = assignLanes(specs, 10);

    assert.strictEqual(laneCount, 3);
  });

  test('should be deterministic across calls', () => {
    const specs = [
      makeSpec(0, 10, [100]),
      makeSpec(1, 10, [100]),
      makeSpec(2, 150, [250]),
    ];
    const first = assignLanes(specs, 10);
    const second = assignLanes(specs, 10);

    assert.deepStrictEqual([...first.laneOf.entries()], [...second.laneOf.entries()]);
    assert.strictEqual(first.laneCount, second.laneCount);
  });

  test('should break ties by ordinal for identical intervals', () => {
    const specs = [
      makeSpec(1, 10, [100]),
      makeSpec(0, 10, [100]),
    ];
    const { laneOf } = assignLanes(specs, 10);

    assert.strictEqual(laneOf.get(0), 0, 'smaller ordinal should take the inner lane');
    assert.strictEqual(laneOf.get(1), 1);
  });
});

suite('WireRouter - laneX', () => {
  test('should offset lanes from process end', () => {
    assert.strictEqual(laneX(100, 0), 100 + DiagramDefine.IMG_MARGIN);
    assert.strictEqual(laneX(100, 2), 100 + DiagramDefine.IMG_MARGIN + 2 * DiagramDefine.LINE_OFFSET);
  });
});

suite('WireRouter - routeWires', () => {
  const colorTable = ['AA0000', '00BB00', '0000CC'];

  test('should assign colors round-robin by ordinal', () => {
    const specs = [
      makeSpec(0, 10, [100]),
      makeSpec(1, 40, [130]),
      makeSpec(2, 70, [160]),
      makeSpec(3, 200, [300]),
    ];
    const { wires } = routeWires(specs, 100, colorTable);

    assert.strictEqual(wires[0].color, 'AA0000');
    assert.strictEqual(wires[1].color, '00BB00');
    assert.strictEqual(wires[2].color, '0000CC');
    assert.strictEqual(wires[3].color, 'AA0000');
  });

  test('should compute exit and vertical geometry on the assigned lane', () => {
    const specs = [makeSpec(0, 60, [30, 90])];
    const { wires, exitEndX } = routeWires(specs, 100, colorTable);
    const wire = wires[0];
    const expectedLaneX = laneX(100, 0);

    assert.strictEqual(wire.exit.start.x, 100);
    assert.strictEqual(wire.exit.start.y, 60);
    assert.strictEqual(wire.exit.end.x, expectedLaneX);
    assert.ok(wire.vertical);
    assert.deepStrictEqual(wire.vertical!.start, { x: expectedLaneX, y: 30 });
    assert.deepStrictEqual(wire.vertical!.end, { x: expectedLaneX, y: 90 });
    assert.strictEqual(wire.enters.length, 2);
    assert.strictEqual(exitEndX, expectedLaneX);
  });

  test('should compress width by sharing lanes', () => {
    // Y区間が離れた2本 → レーン共有 → exitEndX はレーン1本分
    const specs = [
      makeSpec(0, 10, [40]),
      makeSpec(1, 100, [130]),
    ];
    const { exitEndX } = routeWires(specs, 100, colorTable);

    assert.strictEqual(exitEndX, laneX(100, 0));
  });

  test('should leave vertical null for unconnected wires', () => {
    const { wires } = routeWires([makeSpec(0, 50, [])], 100, colorTable);

    assert.strictEqual(wires[0].vertical, null);
    assert.strictEqual(wires[0].enters.length, 0);
  });

  test('should return exitEndX 0 for no wires', () => {
    const { wires, exitEndX } = routeWires([], 100, colorTable);

    assert.strictEqual(wires.length, 0);
    assert.strictEqual(exitEndX, 0);
  });
});

suite('WireRouter - computeJumpXs', () => {
  const h = { y: 50, x1: 10, x2: 100 };

  test('should detect strict interior crossings in ascending order', () => {
    const verticals = [
      { x: 80, y1: 0, y2: 100 },
      { x: 30, y1: 40, y2: 60 },
    ];
    assert.deepStrictEqual(computeJumpXs(h, verticals), [30, 80]);
  });

  test('should ignore endpoint contacts', () => {
    const verticals = [
      { x: 10, y1: 0, y2: 100 },   // v.x == h.x1
      { x: 100, y1: 0, y2: 100 },  // v.x == h.x2
      { x: 50, y1: 50, y2: 100 },  // v.y1 == h.y
      { x: 60, y1: 0, y2: 50 },    // v.y2 == h.y
    ];
    assert.deepStrictEqual(computeJumpXs(h, verticals), []);
  });

  test('should ignore verticals outside the horizontal Y', () => {
    const verticals = [{ x: 50, y1: 60, y2: 100 }];
    assert.deepStrictEqual(computeJumpXs(h, verticals), []);
  });

  test('should deduplicate identical crossing X', () => {
    const verticals = [
      { x: 50, y1: 0, y2: 100 },
      { x: 50, y1: 40, y2: 60 },
    ];
    assert.deepStrictEqual(computeJumpXs(h, verticals), [50]);
  });
});

suite('WireRouter - mergeJumpXs', () => {
  test('should create a single arc span for one crossing', () => {
    const spans = mergeJumpXs([50], 4, 3, 0, 100);
    assert.deepStrictEqual(spans, [{ startX: 46, endX: 54 }]);
  });

  test('should merge crossings 10px apart into one bridge', () => {
    // アーク間の平坦部 = 10 - 2*4 = 2 < 3 → 結合
    const spans = mergeJumpXs([50, 60], 4, 3, 0, 100);
    assert.deepStrictEqual(spans, [{ startX: 46, endX: 64 }]);
  });

  test('should keep crossings 11px or more apart as separate arcs', () => {
    // アーク間の平坦部 = 11 - 2*4 = 3 >= 3 → 独立
    const spans = mergeJumpXs([50, 61], 4, 3, 0, 100);
    assert.deepStrictEqual(spans, [
      { startX: 46, endX: 54 },
      { startX: 57, endX: 65 },
    ]);
  });

  test('should clamp spans to the segment range', () => {
    const spans = mergeJumpXs([2, 98], 4, 3, 0, 100);
    assert.deepStrictEqual(spans, [
      { startX: 0, endX: 6 },
      { startX: 94, endX: 100 },
    ]);
  });

  test('should return empty for no crossings', () => {
    assert.deepStrictEqual(mergeJumpXs([], 4, 3, 0, 100), []);
  });
});
