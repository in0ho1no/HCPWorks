import * as assert from 'assert';
import { Line, Process2Data } from '../connector';

suite('Line - Class', () => {
  test('lineWidth calculation', () => {
    const line1 = new Line({ x: 0, y: 0 }, { x: 10, y: 0 });
    assert.strictEqual(line1.lineWidth(), 10, 'Positive width should be calculated correctly');

    const line2 = new Line({ x: 10, y: 0 }, { x: 0, y: 0 });
    assert.strictEqual(line2.lineWidth(), 10, 'Width should be absolute when end < start');

    const line3 = new Line({ x: 5, y: 0 }, { x: 5, y: 10 });
    assert.strictEqual(line3.lineWidth(), 0, 'Width should be 0 for vertical line');
  });

  test('lineHeight calculation', () => {
    const line1 = new Line({ x: 0, y: 0 }, { x: 0, y: 10 });
    assert.strictEqual(line1.lineHeight(), 10, 'Positive height should be calculated correctly');

    const line2 = new Line({ x: 0, y: 10 }, { x: 0, y: 0 });
    assert.strictEqual(line2.lineHeight(), 10, 'Height should be absolute when end < start');

    const line3 = new Line({ x: 0, y: 5 }, { x: 10, y: 5 });
    assert.strictEqual(line3.lineHeight(), 0, 'Height should be 0 for horizontal line');
  });

  test('should calculate width and height for diagonal lines', () => {
    const line = new Line({ x: 5, y: 5 }, { x: 15, y: 25 });

    assert.strictEqual(line.lineWidth(), 10);
    assert.strictEqual(line.lineHeight(), 20);
  });

  test('should handle zero length lines', () => {
    const zeroLine = new Line({ x: 5, y: 5 }, { x: 5, y: 5 });

    assert.strictEqual(zeroLine.lineWidth(), 0);
    assert.strictEqual(zeroLine.lineHeight(), 0);
  });

  test('should handle negative coordinates', () => {
    const line = new Line({ x: -10, y: -20 }, { x: -5, y: -5 });

    assert.strictEqual(line.lineWidth(), 5);
    assert.strictEqual(line.lineHeight(), 15);
  });
});

suite('Process2Data - Class', () => {
  test('should create a Process2Data with default values', () => {
    const connection = new Process2Data();

    assert.strictEqual(connection.exitFromProcess, null);
    assert.strictEqual(connection.betweenProcessData, null);
    assert.strictEqual(connection.enterToData, null);
    assert.strictEqual(connection.color, 'black');
  });

  test('should allow setting lines and color', () => {
    const connection = new Process2Data();

    const line1 = new Line({ x: 0, y: 0 }, { x: 10, y: 10 });
    const line2 = new Line({ x: 10, y: 10 }, { x: 20, y: 10 });
    const line3 = new Line({ x: 20, y: 10 }, { x: 30, y: 20 });

    connection.exitFromProcess = line1;
    connection.betweenProcessData = line2;
    connection.enterToData = line3;
    connection.color = 'red';

    assert.deepStrictEqual(connection.exitFromProcess, line1);
    assert.deepStrictEqual(connection.betweenProcessData, line2);
    assert.deepStrictEqual(connection.enterToData, line3);
    assert.strictEqual(connection.color, 'red');
  });
});
