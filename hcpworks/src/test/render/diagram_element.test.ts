import * as assert from 'assert';
import { DiagramElement } from '../../render/diagram_element';
import { LineInfo } from '../../parse/line_info';

suite('DiagramElement - Constructor - initial values', () => {
  test('should initialize x, y, endX to 0', () => {
    const li = new LineInfo();
    const element = new DiagramElement(li);
    assert.strictEqual(element.getX(), 0);
    assert.strictEqual(element.getY(), 0);
    assert.strictEqual(element.getEndX(), 0);
  });

  test('should store the LineInfo passed to constructor', () => {
    const li = new LineInfo();
    li.setTextOrg('processA');
    li.updateType();
    li.updateLineIO();
    const element = new DiagramElement(li);
    assert.strictEqual(element.getLineInfo(), li);
  });
});

suite('DiagramElement - Method - setX / getX', () => {
  test('should set and get x coordinate', () => {
    const li = new LineInfo();
    const element = new DiagramElement(li);
    element.setX(100);
    assert.strictEqual(element.getX(), 100);
  });

  test('should update x coordinate', () => {
    const li = new LineInfo();
    const element = new DiagramElement(li);
    element.setX(50);
    element.setX(200);
    assert.strictEqual(element.getX(), 200);
  });

  test('should allow x = 0', () => {
    const li = new LineInfo();
    const element = new DiagramElement(li);
    element.setX(99);
    element.setX(0);
    assert.strictEqual(element.getX(), 0);
  });
});

suite('DiagramElement - Method - setY / getY', () => {
  test('should set and get y coordinate', () => {
    const li = new LineInfo();
    const element = new DiagramElement(li);
    element.setY(150);
    assert.strictEqual(element.getY(), 150);
  });

  test('should update y coordinate', () => {
    const li = new LineInfo();
    const element = new DiagramElement(li);
    element.setY(30);
    element.setY(300);
    assert.strictEqual(element.getY(), 300);
  });

  test('should allow y = 0', () => {
    const li = new LineInfo();
    const element = new DiagramElement(li);
    element.setY(42);
    element.setY(0);
    assert.strictEqual(element.getY(), 0);
  });
});

suite('DiagramElement - Method - setEndX / getEndX', () => {
  test('should set and get endX coordinate', () => {
    const li = new LineInfo();
    const element = new DiagramElement(li);
    element.setEndX(250);
    assert.strictEqual(element.getEndX(), 250);
  });

  test('should update endX coordinate', () => {
    const li = new LineInfo();
    const element = new DiagramElement(li);
    element.setEndX(10);
    element.setEndX(500);
    assert.strictEqual(element.getEndX(), 500);
  });

  test('should allow endX = 0', () => {
    const li = new LineInfo();
    const element = new DiagramElement(li);
    element.setEndX(77);
    element.setEndX(0);
    assert.strictEqual(element.getEndX(), 0);
  });
});

suite('DiagramElement - Method - getLineInfo', () => {
  test('should return the exact LineInfo instance passed to constructor', () => {
    const li = new LineInfo();
    li.setTextOrg('testProcess');
    li.updateType();
    li.updateLineIO();
    const element = new DiagramElement(li);
    const result = element.getLineInfo();
    assert.strictEqual(result, li);
  });

  test('should return LineInfo with correct text', () => {
    const li = new LineInfo();
    li.setTextOrg('\\fork condition');
    li.updateType();
    li.updateLineIO();
    const element = new DiagramElement(li);
    assert.strictEqual(element.getLineInfo().getTextLessTypeIO(), 'condition');
  });

  test('should be independent for different DiagramElement instances', () => {
    const li1 = new LineInfo();
    li1.setTextOrg('processA');
    li1.updateType();
    li1.updateLineIO();

    const li2 = new LineInfo();
    li2.setTextOrg('processB');
    li2.updateType();
    li2.updateLineIO();

    const e1 = new DiagramElement(li1);
    const e2 = new DiagramElement(li2);

    assert.strictEqual(e1.getLineInfo(), li1);
    assert.strictEqual(e2.getLineInfo(), li2);
    assert.notStrictEqual(e1.getLineInfo(), e2.getLineInfo());
  });
});
