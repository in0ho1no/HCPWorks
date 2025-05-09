import * as vscode from 'vscode';
import { parseModules, Module } from '../parse/file_parse';
import { ModuleTreeElement } from './tree_element';

/**
 * VSCode拡張機能のTreeViewにモジュールツリーを提供する。
 * モジュールの階層構造をVSCodeのUIで表示するためのデータプロバイダーとして機能する。
 * @implements {vscode.TreeDataProvider<ModuleTreeElement>}
 */
export class ModuleTreeProvider implements vscode.TreeDataProvider<ModuleTreeElement> {
  /**
   * ツリーデータの変更を通知するためのイベントエミッター
   * (refreshを拾えるようにする)
   * @private
   */
  private _onDidChangeTreeData: vscode.EventEmitter<ModuleTreeElement | undefined | void> = new vscode.EventEmitter<ModuleTreeElement | undefined | void>();
  /**
   * ツリーデータの変更を検知するためのイベント
   * (外部のコードがサブスクライブできるようにするための公開プロパティ)
   * @readonly
   */
  readonly onDidChangeTreeData: vscode.Event<ModuleTreeElement | undefined | void> = this._onDidChangeTreeData.event;

  /**
   * ツリーのルート要素を格納する配列
   * @private
   */
  private rootElements: ModuleTreeElement[];

  /**
   * ModuleTreeProviderのインスタンスを作成する
   */
  constructor() {
    this.rootElements = [];
  }

  /**
   * 指定された要素に対応するVSCodeのTreeItemを返す(必須APIの1つ)
   * @param {ModuleTreeElement} element - ツリー要素
   * @returns {vscode.TreeItem | Thenable<vscode.TreeItem>} 対応するVSCodeのTreeItem
   */
  getTreeItem(element: ModuleTreeElement): vscode.TreeItem | Thenable<vscode.TreeItem> {
    const collapsibleState =
      element.children.length > 0
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None;
    const treeItem = new vscode.TreeItem(element.name, collapsibleState);
    treeItem.command = {
      command: 'hcpworks.itemClicked',
      title: 'HCPWorks: Item Clicked',
      arguments: [element]
    };
    return treeItem;
  }

  /**
   * 指定された要素の子要素を返す(必須APIの1つ)
   * 要素が指定されていない場合はルート要素を返す
   * @param {ModuleTreeElement} [element] - 親要素（省略可能）
   * @returns {vscode.ProviderResult<ModuleTreeElement[]>} 子要素の配列
   */
  getChildren(element?: ModuleTreeElement): vscode.ProviderResult<ModuleTreeElement[]> {
    return element
      ? element.children
      : this.rootElements;
  }

  /**
   * ツリーが変更されたことをVSCodeに通知する
   */
  // treeviewそのものの更新
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * ファイルの内容からルート要素を更新する
   * @param {string} filePath - 解析するファイルのフルパス
   * @param {string} fileContents - 解析するファイルの内容
   */
  updateRootElements(filePath: string, fileContents: string): void {
    const modules = parseModules(fileContents);
    this.rootElements = this.createModuleElements(filePath, modules);
  }

  /**
   * モジュール配列からModuleTreeElement配列を作成する
   * @param {string} filePath - モジュールのフルパス
   * @param {Module[]} modules - モジュールの配列
   * @returns {ModuleTreeElement[]} ModuleTreeElement配列
   * @private
   */
  private createModuleElements(filePath: string, modules: Module[]): ModuleTreeElement[] {
    return modules.length > 0
      ? modules.map((module, index) =>
        new ModuleTreeElement(filePath, module.name, module.content)
      )
      : [new ModuleTreeElement("", "モジュールが存在しません。", ["",])];
  }

  getRootElements(): ModuleTreeElement[] {
    return this.rootElements;
  }
}
