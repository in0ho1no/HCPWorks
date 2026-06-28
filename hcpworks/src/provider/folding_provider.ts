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
    let tableStartLine: number | null = null;
    let lastNonEmptyLine = -1;

    const closeTable = (endLine: number): void => {
      if (tableStartLine !== null && endLine > tableStartLine) {
        ranges.push(new vscode.FoldingRange(tableStartLine, endLine, vscode.FoldingRangeKind.Region));
      }
      tableStartLine = null;
    };

    for (let i = 0; i < lineCount; i++) {
      const lineText = document.lineAt(i).text;
      const trimmed = lineText.trimStart();
      const isEmpty = lineText.trim() === '';

      if (trimmed.startsWith('\\module')) {
        closeTable(lastNonEmptyLine);
        if (moduleStartLine !== null) {
          const endLine = this.findRangeEnd(document, moduleStartLine, i - 1);
          if (endLine > moduleStartLine) {
            ranges.push(new vscode.FoldingRange(moduleStartLine, endLine, vscode.FoldingRangeKind.Region));
          }
        }
        moduleStartLine = i;
      } else if (trimmed.startsWith('\\table')) {
        closeTable(lastNonEmptyLine);
        tableStartLine = i;
      } else if (trimmed.startsWith('\\data') && tableStartLine !== null) {
        closeTable(lastNonEmptyLine);
      } else if (isEmpty && tableStartLine !== null) {
        closeTable(lastNonEmptyLine);
      }

      if (!isEmpty) {
        lastNonEmptyLine = i;
      }
    }

    closeTable(lastNonEmptyLine);

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
