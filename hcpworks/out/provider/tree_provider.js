"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
const file_parse_1 = require("../parse/file_parse");
const tree_element_1 = require("./tree_element");
/**
 * VSCode拡張機能のTreeViewにモジュールツリーを提供する。
 * モジュールの階層構造をVSCodeのUIで表示するためのデータプロバイダーとして機能する。
 * @implements {vscode.TreeDataProvider<ModuleTreeElement>}
 */
class ModuleTreeProvider {
    /**
     * ツリーデータの変更を通知するためのイベントエミッター
     * (refreshを拾えるようにする)
     * @private
     */
    _onDidChangeTreeData = new vscode.EventEmitter();
    /**
     * ツリーデータの変更を検知するためのイベント
     * (外部のコードがサブスクライブできるようにするための公開プロパティ)
     * @readonly
     */
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    /**
     * ツリーのルート要素を格納する配列
     * @private
     */
    rootElements;
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
    getTreeItem(element) {
        const collapsibleState = element.children.length > 0
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
    getChildren(element) {
        return element
            ? element.children
            : this.rootElements;
    }
    /**
     * ツリーが変更されたことをVSCodeに通知する
     */
    // treeviewそのものの更新
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    /**
     * ファイルの内容からルート要素を更新する
     * @param {string} filePath - 解析するファイルのフルパス
     * @param {string} fileContents - 解析するファイルの内容
     */
    updateRootElements(filePath, fileContents) {
        const modules = (0, file_parse_1.parseModules)(fileContents);
        this.rootElements = this.createModuleElements(filePath, modules);
    }
    /**
     * モジュール配列からModuleTreeElement配列を作成する
     * @param {string} filePath - モジュールのフルパス
     * @param {Module[]} modules - モジュールの配列
     * @returns {ModuleTreeElement[]} ModuleTreeElement配列
     * @private
     */
    createModuleElements(filePath, modules) {
        return modules.length > 0
            ? modules.map((module, index) => new tree_element_1.ModuleTreeElement(filePath, module.name, module.content))
            : [new tree_element_1.ModuleTreeElement("", "モジュールが存在しません。", ["",])];
    }
    getRootElements() {
        return this.rootElements;
    }
}
exports.ModuleTreeProvider = ModuleTreeProvider;
//# sourceMappingURL=tree_provider.js.map