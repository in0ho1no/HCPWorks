import * as assert from 'assert';
import { DataInfo, InOutData } from '../data_info';
import { Wire, Process2Data } from '../wire';

suite('DataInfo - Class', () => {
  test('should create a new DataInfo instance with the given name', () => {
    const name = 'testData';
    const dataInfo = new DataInfo(name);

    assert.strictEqual(dataInfo.name, name, 'DataInfo name should match the provided name');
    assert.strictEqual(dataInfo.connectLine, null, 'connectLine should be initialized as null');
  });

  test('should allow setting connectLine property', () => {
    const dataInfo = new DataInfo('testData');

    const connection = new Process2Data();
    const wire1 = new Wire({ x: 0, y: 0 }, { x: 10, y: 10 });
    const wire2 = new Wire({ x: 10, y: 10 }, { x: 20, y: 10 });
    const wire3 = new Wire({ x: 20, y: 10 }, { x: 30, y: 20 });

    connection.exitFromProcess = wire1;
    connection.betweenProcessData = wire2;
    connection.enterToData = wire3;
    connection.color = 'red';

    dataInfo.connectLine = connection;

    assert.strictEqual(dataInfo.connectLine, connection, 'connectLine property should be set correctly');
  });

  test('should allow updating the name property', () => {
    const initialName = 'initialName';
    const newName = 'newName';
    const dataInfo = new DataInfo(initialName);

    dataInfo.name = newName;

    assert.strictEqual(dataInfo.name, newName, 'name property should be updated correctly');
  });
});

suite('InOutData - Class', () => {
  test('should create a new InOutData instance with empty data lists', () => {
    const inOutData = new InOutData();

    assert.deepStrictEqual(inOutData.getInDataList(), [], 'inDataList should be initialized as an empty array');
    assert.deepStrictEqual(inOutData.getOutDataList(), [], 'outDataList should be initialized as an empty array');
  });

  test('should set and get input data list correctly', () => {
    const inData1 = new DataInfo('input1');
    const inData2 = new DataInfo('input2');
    const inDataList = [inData1, inData2];
    const inOutData = new InOutData();

    const result = inOutData.setInDataList(inDataList);

    assert.strictEqual(result, inOutData, 'setInDataList should return this for method chaining');
    assert.strictEqual(inOutData.getInDataList(), inDataList, 'getInDataList should return the set data list');
    assert.strictEqual(inOutData.getInDataList().length, 2, 'inDataList should have 2 items');
  });

  test('should set and get output data list correctly', () => {
    const outData1 = new DataInfo('output1');
    const outDataList = [outData1];
    const inOutData = new InOutData();

    const result = inOutData.setOutDataList(outDataList);

    assert.strictEqual(result, inOutData, 'setOutDataList should return this for method chaining');
    assert.strictEqual(inOutData.getOutDataList(), outDataList, 'getOutDataList should return the set data list');
    assert.strictEqual(inOutData.getOutDataList().length, 1, 'outDataList should have 1 item');
  });

  test('should allow method chaining for setting data lists', () => {
    const inData = new DataInfo('input');
    const outData = new DataInfo('output');
    const inDataList = [inData];
    const outDataList = [outData];
    const inOutData = new InOutData();

    inOutData.setInDataList(inDataList).setOutDataList(outDataList);

    assert.strictEqual(inOutData.getInDataList()[0], inData, 'Input data should be set correctly');
    assert.strictEqual(inOutData.getOutDataList()[0], outData, 'Output data should be set correctly');
  });

  test('should maintain references to the original DataInfo objects', () => {
    const inData = new DataInfo('input');
    const outData = new DataInfo('output');
    const inOutData = new InOutData();
    inOutData.setInDataList([inData]).setOutDataList([outData]);

    inData.name = 'modifiedInput';
    outData.name = 'modifiedOutput';

    assert.strictEqual(inOutData.getInDataList()[0].name, 'modifiedInput', 'Changes to original inData should affect inOutData');
    assert.strictEqual(inOutData.getOutDataList()[0].name, 'modifiedOutput', 'Changes to original outData should affect inOutData');
  });

  test('should handle modifications to the retrieved data lists', () => {
    const inData1 = new DataInfo('input1');
    const inData2 = new DataInfo('input2');
    const inOutData = new InOutData();
    inOutData.setInDataList([inData1]);

    const retrievedList = inOutData.getInDataList();
    retrievedList.push(inData2);

    assert.strictEqual(inOutData.getInDataList().length, 2, 'Internal inDataList should be modified when the retrieved list is modified');
    assert.strictEqual(inOutData.getInDataList()[1], inData2, 'Second item in internal inDataList should be inData2');
  });
});