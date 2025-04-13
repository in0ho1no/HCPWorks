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
  test('should create a new InOutData instance with the given input and output data lists', () => {
    // 準備
    const inData1 = new DataInfo('input1');
    const inData2 = new DataInfo('input2');
    const outData1 = new DataInfo('output1');
    const inDataList = [inData1, inData2];
    const outDataList = [outData1];

    const inOutData = new InOutData(inDataList, outDataList);

    assert.strictEqual(inOutData.inDataList, inDataList, 'inDataList should match the provided input data list');
    assert.strictEqual(inOutData.outDataList, outDataList, 'outDataList should match the provided output data list');
  });

  test('should create an InOutData instance with empty arrays', () => {
    const emptyInDataList: DataInfo[] = [];
    const emptyOutDataList: DataInfo[] = [];

    const inOutData = new InOutData(emptyInDataList, emptyOutDataList);

    assert.deepStrictEqual(inOutData.inDataList, [], 'inDataList should be an empty array');
    assert.deepStrictEqual(inOutData.outDataList, [], 'outDataList should be an empty array');
  });

  test('should maintain references to the original DataInfo objects', () => {
    const inData = new DataInfo('input');
    const outData = new DataInfo('output');
    const inOutData = new InOutData([inData], [outData]);

    inData.name = 'modifiedInput';
    outData.name = 'modifiedOutput';

    assert.strictEqual(inOutData.inDataList[0].name, 'modifiedInput', 'Changes to original inData should affect inOutData');
    assert.strictEqual(inOutData.outDataList[0].name, 'modifiedOutput', 'Changes to original outData should affect inOutData');
  });

  test('should handle modifications to the data lists', () => {
    const inData1 = new DataInfo('input1');
    const inData2 = new DataInfo('input2');
    const outData1 = new DataInfo('output1');
    const inDataList = [inData1];
    const outDataList = [outData1];
    const inOutData = new InOutData(inDataList, outDataList);

    inOutData.inDataList.push(inData2);

    assert.strictEqual(inOutData.inDataList.length, 2, 'inDataList should have 2 items after push');
    assert.strictEqual(inOutData.inDataList[1], inData2, 'Second item in inDataList should be inData2');
  });
});
