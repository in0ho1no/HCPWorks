import * as assert from 'assert';
import { Wire, Process2Data } from '../../parse/wire';

suite('Wire - Class', () => {
  test('wireWidth calculation', () => {
    const wire1 = new Wire({ x: 0, y: 0 }, { x: 10, y: 0 });
    assert.strictEqual(wire1.wireWidth(), 10, 'Positive width should be calculated correctly');

    const wire2 = new Wire({ x: 10, y: 0 }, { x: 0, y: 0 });
    assert.strictEqual(wire2.wireWidth(), 10, 'Width should be absolute when end < start');

    const wire3 = new Wire({ x: 5, y: 0 }, { x: 5, y: 10 });
    assert.strictEqual(wire3.wireWidth(), 0, 'Width should be 0 for vertical wire');
  });

  test('wireHeight calculation', () => {
    const wire1 = new Wire({ x: 0, y: 0 }, { x: 0, y: 10 });
    assert.strictEqual(wire1.wireHeight(), 10, 'Positive height should be calculated correctly');

    const wire2 = new Wire({ x: 0, y: 10 }, { x: 0, y: 0 });
    assert.strictEqual(wire2.wireHeight(), 10, 'Height should be absolute when end < start');

    const wire3 = new Wire({ x: 0, y: 5 }, { x: 10, y: 5 });
    assert.strictEqual(wire3.wireHeight(), 0, 'Height should be 0 for horizontal wire');
  });

  test('should calculate width and height for diagonal wires', () => {
    const wire = new Wire({ x: 5, y: 5 }, { x: 15, y: 25 });

    assert.strictEqual(wire.wireWidth(), 10);
    assert.strictEqual(wire.wireHeight(), 20);
  });

  test('should handle zero length wires', () => {
    const zerowire = new Wire({ x: 5, y: 5 }, { x: 5, y: 5 });

    assert.strictEqual(zerowire.wireWidth(), 0);
    assert.strictEqual(zerowire.wireHeight(), 0);
  });

  test('should handle negative coordinates', () => {
    const wire = new Wire({ x: -10, y: -20 }, { x: -5, y: -5 });

    assert.strictEqual(wire.wireWidth(), 5);
    assert.strictEqual(wire.wireHeight(), 15);
  });
});

suite('Process2Data - Class', () => {
  test('should create a Process2Data with default values', () => {
    const connection = new Process2Data();

    assert.strictEqual(connection.exitFromProcess, null);
    assert.strictEqual(connection.betweenProcessData, null);
    assert.strictEqual(connection.enterToData, null);
    assert.strictEqual(connection.color, '000000');
  });

  test('should allow setting wires and color', () => {
    const connection = new Process2Data();

    const wire1 = new Wire({ x: 0, y: 0 }, { x: 10, y: 10 });
    const wire2 = new Wire({ x: 10, y: 10 }, { x: 20, y: 10 });
    const wire3 = new Wire({ x: 20, y: 10 }, { x: 30, y: 20 });

    connection.exitFromProcess = wire1;
    connection.betweenProcessData = wire2;
    connection.enterToData = wire3;
    connection.color = 'red';

    assert.deepStrictEqual(connection.exitFromProcess, wire1);
    assert.deepStrictEqual(connection.betweenProcessData, wire2);
    assert.deepStrictEqual(connection.enterToData, wire3);
    assert.strictEqual(connection.color, 'red');
  });
});
