import { defineConfig } from '@vscode/test-cli';
import * as path from 'path';

// テスト結果の出力先ディレクトリ
const testResultsPath = path.resolve('test-results');

export default defineConfig({
	files: 'out/test/**/*.test.js',
    mocha: {
        reporter: 'mocha-junit-reporter',
        reporterOptions: {
            mochaFile: path.join(testResultsPath, 'test-results.xml')
        }
    }
});
