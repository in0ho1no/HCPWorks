import * as vscode from 'vscode';
import {parseModules, Module} from './file_parse';
import {ModuleTreeElement} from './tree_element';

export class ModuleTreeProvider implements vscode.TreeDataProvider<ModuleTreeElement> {
  // refreshを拾えるようにする
  private _onDidChangeTreeData: vscode.EventEmitter<ModuleTreeElement | undefined | void> = new vscode.EventEmitter<ModuleTreeElement | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<ModuleTreeElement | undefined | void> = this._onDidChangeTreeData.event;

  private rootElements: ModuleTreeElement[];

  constructor() {
    this.rootElements = [];
  }

  // 必須APIの1つ
  getTreeItem(element: ModuleTreeElement): vscode.TreeItem | Thenable<vscode.TreeItem> {
    const collapsibleState = 
      element.children.length > 0
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None;
    return new vscode.TreeItem(element.name, collapsibleState);
  }

  // 必須APIの1つ
  getChildren(element?: ModuleTreeElement): vscode.ProviderResult<ModuleTreeElement[]> {
    return element
      ? element.children
      : this.rootElements;
  }

  // treeviewそのものの更新
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  // treeviewの要素更新
  updateRootElements(file_contents: string): void {
    const modules = parseModules(file_contents);
    this.rootElements = this.createModuleElements(modules);
  }

  private createModuleElements(modules: Module[]): ModuleTreeElement[] {
    return modules.length > 0
    ?  modules.map((module, index) => 
        new ModuleTreeElement(module.name, module.content)
      )
    : [new ModuleTreeElement("モジュールが存在しません。", ["",])];
  }
}
