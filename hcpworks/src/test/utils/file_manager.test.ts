import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FileManager } from '../../utils/file_manager';

/**
 * fs.writeFile はコールバックで完了するため、ファイルが期待サイズまで書き込まれるのを待機する
 */
function waitForFile(filePath: string, expectedSize: number, timeoutMs = 2000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const poll = () => {
      if (fs.existsSync(filePath) && fs.statSync(filePath).size >= expectedSize) {
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        reject(new Error(`File was not written within ${timeoutMs}ms: ${filePath}`));
      } else {
        setTimeout(poll, 10);
      }
    };
    poll();
  });
}

suite('FileManager - Method - saveImageToFile', () => {
  let tmpDir: string;

  setup(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hcpworks-test-'));
  });

  teardown(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('should decode a png data URL and write the original bytes', async () => {
    const fileManager = new FileManager();
    const filePath = path.join(tmpDir, 'out.png');

    // 既知のバイト列をbase64化してdata URLを組み立てる
    const originalBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNGシグネチャ
    const dataUrl = 'data:image/png;base64,' + originalBytes.toString('base64');

    fileManager.saveImageToFile(filePath, dataUrl);
    await waitForFile(filePath, originalBytes.length);

    const written = fs.readFileSync(filePath);
    assert.ok(written.equals(originalBytes), 'written bytes should match the decoded data URL');
  });

  test('should decode a webp data URL and write the original bytes', async () => {
    const fileManager = new FileManager();
    const filePath = path.join(tmpDir, 'out.webp');

    const originalBytes = Buffer.from([0x52, 0x49, 0x46, 0x46]); // "RIFF" (WebP先頭)
    const dataUrl = 'data:image/webp;base64,' + originalBytes.toString('base64');

    fileManager.saveImageToFile(filePath, dataUrl);
    await waitForFile(filePath, originalBytes.length);

    const written = fs.readFileSync(filePath);
    assert.ok(written.equals(originalBytes), 'written bytes should match the decoded data URL');
  });

  test('should handle base64 payload without the data URL prefix', async () => {
    const fileManager = new FileManager();
    const filePath = path.join(tmpDir, 'out_noprefix.png');

    const originalBytes = Buffer.from([0x01, 0x02, 0x03, 0x04]);
    const base64Only = originalBytes.toString('base64');

    fileManager.saveImageToFile(filePath, base64Only);
    await waitForFile(filePath, originalBytes.length);

    const written = fs.readFileSync(filePath);
    assert.ok(written.equals(originalBytes), 'written bytes should match the decoded base64 payload');
  });
});
