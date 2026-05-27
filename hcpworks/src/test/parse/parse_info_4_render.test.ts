import * as assert from 'assert';
import { ParseInfo4Render } from '../../parse/parse_info_4_render';
import { ProcessLineProcessor } from '../../parse/line_info_list_process';
import { DataLineProcessor } from '../../parse/line_info_list_data';
import { LineInfo } from '../../parse/line_info';

function makeLineInfo(text: string): LineInfo {
  const li = new LineInfo();
  li.setTextOrg(text);
  li.updateLevel();
  li.updateType();
  li.updateLineIO();
  return li;
}

function makeDataLineInfo(name: string, level: number): LineInfo {
  const li = new LineInfo();
  li.setTextOrg('\\data ' + name);
  li.setLevel(level);
  li.updateType();
  li.setTextLessTypeIO(name);
  return li;
}

function buildProcessLines(lines: LineInfo[], limitLevel: number = 10): ProcessLineProcessor {
  return ProcessLineProcessor.process(lines, limitLevel);
}

function buildDataLines(lines: LineInfo[]): DataLineProcessor {
  return DataLineProcessor.process(lines);
}

suite('ParseInfo4Render - Method - getProcessLines / getDataLines', () => {
  test('should return the same ProcessLineProcessor passed to constructor', () => {
    const processLines = buildProcessLines([makeLineInfo('processA')]);
    const dataLines = buildDataLines([makeLineInfo('\\data dataX')]);
    const render = new ParseInfo4Render(processLines, dataLines);

    assert.strictEqual(render.getProcessLines(), processLines);
  });

  test('should return the same DataLineProcessor passed to constructor', () => {
    const processLines = buildProcessLines([makeLineInfo('processA')]);
    const dataLines = buildDataLines([makeLineInfo('\\data dataX')]);
    const render = new ParseInfo4Render(processLines, dataLines);

    assert.strictEqual(render.getDataLines(), dataLines);
  });
});

suite('ParseInfo4Render - Method - mergeIoData', () => {
  test('should add \\in referenced data to dataLines when not already present', () => {
    const processLines = buildProcessLines([
      makeLineInfo('processA \\in newData'),
    ]);
    const dataLines = buildDataLines([
      makeLineInfo('\\data existingData'),
    ]);
    const render = new ParseInfo4Render(processLines, dataLines);
    render.mergeIoData();

    const dataNames = render.getDataLines().getLineInfoList().map(li => li.getTextLessTypeIO());
    assert.ok(dataNames.includes('newData'), 'newData should be added from \\in reference');
    assert.ok(dataNames.includes('existingData'), 'existingData should still be present');
    assert.strictEqual(dataNames.length, 2);
  });

  test('should add \\out referenced data to dataLines when not already present', () => {
    const processLines = buildProcessLines([
      makeLineInfo('processB \\out resultData'),
    ]);
    const dataLines = buildDataLines([
      makeLineInfo('\\data existingData'),
    ]);
    const render = new ParseInfo4Render(processLines, dataLines);
    render.mergeIoData();

    const dataNames = render.getDataLines().getLineInfoList().map(li => li.getTextLessTypeIO());
    assert.ok(dataNames.includes('resultData'), 'resultData should be added from \\out reference');
  });

  test('should not add duplicate when \\in data already exists in dataLines', () => {
    const processLines = buildProcessLines([
      makeLineInfo('processA \\in existingData'),
    ]);
    const dataLines = buildDataLines([
      makeLineInfo('\\data existingData'),
    ]);
    const render = new ParseInfo4Render(processLines, dataLines);
    render.mergeIoData();

    const dataNames = render.getDataLines().getLineInfoList().map(li => li.getTextLessTypeIO());
    const count = dataNames.filter(name => name === 'existingData').length;
    assert.strictEqual(count, 1, 'existingData should appear exactly once');
  });

  test('should not add duplicate when \\out data already exists in dataLines', () => {
    const processLines = buildProcessLines([
      makeLineInfo('processB \\out existingOut'),
    ]);
    const dataLines = buildDataLines([
      makeLineInfo('\\data existingOut'),
    ]);
    const render = new ParseInfo4Render(processLines, dataLines);
    render.mergeIoData();

    const dataNames = render.getDataLines().getLineInfoList().map(li => li.getTextLessTypeIO());
    const count = dataNames.filter(name => name === 'existingOut').length;
    assert.strictEqual(count, 1, 'existingOut should appear exactly once');
  });

  test('should add multiple \\in and \\out data not already in dataLines', () => {
    const processLines = buildProcessLines([
      makeLineInfo('processA \\in inputA \\in inputB \\out outputA'),
    ]);
    const dataLines = buildDataLines([]);
    const render = new ParseInfo4Render(processLines, dataLines);
    render.mergeIoData();

    const dataNames = render.getDataLines().getLineInfoList().map(li => li.getTextLessTypeIO());
    assert.ok(dataNames.includes('inputA'), 'inputA should be added');
    assert.ok(dataNames.includes('inputB'), 'inputB should be added');
    assert.ok(dataNames.includes('outputA'), 'outputA should be added');
    assert.strictEqual(dataNames.length, 3);
  });

  test('should handle process lines with no \\in or \\out', () => {
    const processLines = buildProcessLines([
      makeLineInfo('processA'),
      makeLineInfo('processB'),
    ]);
    const initialDataList = [makeLineInfo('\\data dataX')];
    const dataLines = buildDataLines(initialDataList);
    const initialCount = dataLines.getLineInfoList().length;
    const render = new ParseInfo4Render(processLines, dataLines);
    render.mergeIoData();

    assert.strictEqual(render.getDataLines().getLineInfoList().length, initialCount,
      'dataLines should not change when no \\in or \\out in processLines');
  });

  test('should use dataLines minLevel for new data entries', () => {
    const processLines = buildProcessLines([
      makeLineInfo('processA \\in newData'),
    ]);
    // dataLines with minLevel = 2 (all at level 2)
    const li = makeDataLineInfo('existingData', 2);
    const dataLines = new DataLineProcessor();
    dataLines.setLineInfoList([li]);
    dataLines.setMinLevel();

    const render = new ParseInfo4Render(processLines, dataLines);
    render.mergeIoData();

    const dataList = render.getDataLines().getLineInfoList();
    const newDataEntry = dataList.find(d => d.getTextLessTypeIO() === 'newData');
    assert.ok(newDataEntry, 'newData should be added');
    assert.strictEqual(newDataEntry!.getLevel(), 2, 'new data level should match dataLines minLevel');
  });

  test('should handle multiple process lines each with \\in and \\out', () => {
    const processLines = buildProcessLines([
      makeLineInfo('processA \\in dataA'),
      makeLineInfo('processB \\out dataB'),
      makeLineInfo('processC \\in dataC \\out dataD'),
    ]);
    const dataLines = buildDataLines([]);
    const render = new ParseInfo4Render(processLines, dataLines);
    render.mergeIoData();

    const dataNames = render.getDataLines().getLineInfoList().map(li => li.getTextLessTypeIO());
    assert.ok(dataNames.includes('dataA'));
    assert.ok(dataNames.includes('dataB'));
    assert.ok(dataNames.includes('dataC'));
    assert.ok(dataNames.includes('dataD'));
    assert.strictEqual(dataNames.length, 4);
  });

  test('should not add duplicate when same data is referenced by multiple process lines', () => {
    const processLines = buildProcessLines([
      makeLineInfo('processA \\in sharedData'),
      makeLineInfo('processB \\in sharedData'),
    ]);
    const dataLines = buildDataLines([]);
    const render = new ParseInfo4Render(processLines, dataLines);
    render.mergeIoData();

    const dataNames = render.getDataLines().getLineInfoList().map(li => li.getTextLessTypeIO());
    const count = dataNames.filter(name => name === 'sharedData').length;
    assert.strictEqual(count, 1, 'sharedData should appear exactly once even if referenced multiple times');
  });

  test('should handle empty processLines and empty dataLines', () => {
    const processLines = buildProcessLines([]);
    const dataLines = buildDataLines([]);
    const render = new ParseInfo4Render(processLines, dataLines);
    assert.doesNotThrow(() => render.mergeIoData());
    assert.deepStrictEqual(render.getDataLines().getLineInfoList(), []);
  });
});
