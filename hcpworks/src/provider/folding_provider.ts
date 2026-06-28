import * as vscode from 'vscode';

export class HCPFoldingRangeProvider implements vscode.FoldingRangeProvider {
  provideFoldingRanges(
    document: vscode.TextDocument,
    _context: vscode.FoldingContext,
    _token: vscode.CancellationToken
  ): vscode.FoldingRange[] {
    const ranges: vscode.FoldingRange[] = [];
    const lineCount = document.lineCount;
    let moduleStartLine: number | null = null;

    for (let i = 0; i < lineCount; i++) {
      const lineText = document.lineAt(i).text.trimStart();
      if (lineText.startsWith('\\module')) {
        if (moduleStartLine !== null) {
          const endLine = this.findRangeEnd(document, moduleStartLine, i - 1);
          if (endLine > moduleStartLine) {
            ranges.push(new vscode.FoldingRange(moduleStartLine, endLine, vscode.FoldingRangeKind.Region));
          }
        }
        moduleStartLine = i;
      }
    }

    if (moduleStartLine !== null) {
      const endLine = this.findRangeEnd(document, moduleStartLine, lineCount - 1);
      if (endLine > moduleStartLine) {
        ranges.push(new vscode.FoldingRange(moduleStartLine, endLine, vscode.FoldingRangeKind.Region));
      }
    }

    return ranges;
  }

  private findRangeEnd(document: vscode.TextDocument, startLine: number, candidateEnd: number): number {
    let endLine = candidateEnd;
    while (endLine > startLine && document.lineAt(endLine).text.trim() === '') {
      endLine--;
    }
    return endLine;
  }
}
