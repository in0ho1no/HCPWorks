import * as assert from 'assert';
import { SvgOperator } from '../../render/svg_figure_if';
import { DiagramElement } from '../../render/diagram_element';
import { LineInfo } from '../../parse/line_info';
import { LineTypeEnum, LineTypeDefine } from '../../parse/line_define';

function makeElement(typeEnum: LineTypeEnum, text: string = 'testText', x: number = 50, y: number = 100): DiagramElement {
  const li = new LineInfo();
  const format = LineTypeDefine.get_format_by_type(typeEnum);
  const prefix = format.type_format ? format.type_format + ' ' : '';
  li.setTextOrg(prefix + text);
  li.updateLevel();
  li.updateType();
  li.updateLineIO();
  li.setTextLessTypeIO(text);
  const element = new DiagramElement(li);
  element.setX(x);
  element.setY(y);
  return element;
}

suite('SvgOperator - Constructor', () => {
  test('should create an instance without errors', () => {
    const op = new SvgOperator();
    assert.ok(op instanceof SvgOperator);
  });
});

suite('SvgOperator - Method - drawFigureMethod - NORMAL', () => {
  test('should return [endX, svg] with <circle for NORMAL type', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.NORMAL, 'normalProcess');
    const [endX, svg] = op.drawFigureMethod(element);
    assert.ok(svg.includes('<circle '));
    assert.strictEqual(typeof endX, 'number');
  });

  test('endX should be greater than 0 for NORMAL with text', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.NORMAL, 'process');
    const [endX] = op.drawFigureMethod(element);
    assert.ok(endX > 0);
  });
});

suite('SvgOperator - Method - drawFigureMethod - FORK', () => {
  test('should return svg with <polygon for FORK type', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.FORK, 'condition');
    const [, svg] = op.drawFigureMethod(element);
    assert.ok(svg.includes('<polygon '));
  });

  test('should also include <circle for FORK type', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.FORK, 'condition');
    const [, svg] = op.drawFigureMethod(element);
    assert.ok(svg.includes('<circle '));
  });
});

suite('SvgOperator - Method - drawFigureMethod - REPEAT', () => {
  test('should return svg with <circle for REPEAT type', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.REPEAT, 'loop');
    const [, svg] = op.drawFigureMethod(element);
    assert.ok(svg.includes('<circle '));
  });

  test('should return svg with <path for REPEAT type (arc arrow)', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.REPEAT, 'loop');
    const [, svg] = op.drawFigureMethod(element);
    assert.ok(svg.includes('<path '));
  });
});

suite('SvgOperator - Method - drawFigureMethod - MOD', () => {
  test('should return svg with two <circle elements for MOD type', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.MOD, 'funcCall');
    const [, svg] = op.drawFigureMethod(element);
    const circleCount = (svg.match(/<circle /g) || []).length;
    assert.strictEqual(circleCount, 2);
  });
});

suite('SvgOperator - Method - drawFigureMethod - RETURN', () => {
  test('should return svg with <polygon for RETURN type', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.RETURN, 'returnValue');
    const [, svg] = op.drawFigureMethod(element);
    assert.ok(svg.includes('<polygon '));
  });

  test('should return svg with <line for RETURN type', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.RETURN, 'returnValue');
    const [, svg] = op.drawFigureMethod(element);
    assert.ok(svg.includes('<line '));
  });
});

suite('SvgOperator - Method - drawFigureMethod - TRUE', () => {
  test('should return svg containing "(true)" prefix for TRUE type', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.TRUE, 'x > 0');
    const [, svg] = op.drawFigureMethod(element);
    assert.ok(svg.includes('(true)'));
  });
});

suite('SvgOperator - Method - drawFigureMethod - FALSE', () => {
  test('should return svg containing "(false)" prefix for FALSE type', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.FALSE, 'x <= 0');
    const [, svg] = op.drawFigureMethod(element);
    assert.ok(svg.includes('(false)'));
  });
});

suite('SvgOperator - Method - drawFigureMethod - BRANCH', () => {
  test('should return svg with text wrapped in parentheses for BRANCH type', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.BRANCH, 'caseA');
    const [, svg] = op.drawFigureMethod(element);
    assert.ok(svg.includes('(caseA)'));
  });
});

suite('SvgOperator - Method - drawFigureMethod - DATA', () => {
  test('should return svg with <rect for DATA type', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.DATA, 'myData');
    const [, svg] = op.drawFigureMethod(element);
    assert.ok(svg.includes('<rect '));
  });

  test('endX should be greater than 0 for DATA with text', () => {
    const op = new SvgOperator();
    const element = makeElement(LineTypeEnum.DATA, 'myData');
    const [endX] = op.drawFigureMethod(element);
    assert.ok(endX > 0);
  });
});

suite('SvgOperator - Method - drawFigureMethod - unsupported type', () => {
  test('should return [0, ""] for an unsupported type_value', () => {
    const op = new SvgOperator();
    const li = new LineInfo();
    li.setTextOrg('unknownProcess');
    li.updateLevel();
    li.updateType();
    li.updateLineIO();
    // Manually set an unsupported type_value by overriding via setTextLessTypeIO
    // We need to simulate a type_value of 99 which is not in the map
    // Since we can't easily set type_value directly, we use the MODULE type (9) which is not in the map
    li.setTextOrg('\\module myModule');
    li.updateType();
    li.updateLineIO();
    li.setTextLessTypeIO('myModule');
    const element = new DiagramElement(li);
    element.setX(50);
    element.setY(100);
    const [endX, svg] = op.drawFigureMethod(element);
    // MODULE (type_value=9) is not in figureMethodMap
    assert.strictEqual(endX, 0);
    assert.strictEqual(svg, '');
  });
});
