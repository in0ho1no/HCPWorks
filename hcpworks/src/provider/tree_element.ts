/**
 * モジュールツリー要素を表すクラス。
 * 階層構造を持つツリーの各ノードとして機能し、親子関係を管理する。
 */
export class ModuleTreeElement {
  // 子要素を保持できるようにする
  private _children: ModuleTreeElement[];
  // 親要素を保持できるようにする
  private _parent: ModuleTreeElement | undefined | null;

  /**
   * ModuleTreeElementのインスタンスを作成する
   * @param {string} filePath - モジュールのフルパス
   * @param {string} name - モジュール名
   * @param {string[]} content - モジュール要素に関連するコンテンツ
   */
  constructor(
    public filePath: string,
    public name: string,
    public content: string[],
  ) {
    this._children = [];
  }

  /**
   * 親要素を取得する
   * @returns {ModuleTreeElement | undefined | null} この要素の親要素、または親がない場合はundefined/null
   */
  get parent(): ModuleTreeElement | undefined | null {
    return this._parent;
  }

  /**
   * 子要素の配列を取得する
   * @returns {ModuleTreeElement[]} この要素の子要素の配列
   */
  get children(): ModuleTreeElement[] {
    return this._children;
  }

  /**
   * 指定した要素を子として追加する
   * 子要素がすでに別の親を持っている場合、その関係を解除してから追加する
   * @param {ModuleTreeElement} child - 子として追加する要素
   */
  addChild(child: ModuleTreeElement) {
    // 既存の親要素を削除
    child.parent?.removeChild(child);
    // 子として追加
    this._children.push(child);
    // 自身を親とする
    child._parent = this;
  }

  /**
   * 指定した子要素をこの要素から削除する
   * @param {ModuleTreeElement} child - 削除する子要素
   */
  removeChild(child: ModuleTreeElement) {
    // 自身の子要素から削除する(配列内に存在すれば、そのインデックス位置の要素を削除する)
    const childIndex = this._children.indexOf(child);
    if (childIndex >= 0) {
      // 配列から削除
      this._children.splice(childIndex, 1);
      // 親要素を削除
      child._parent = null;
    }
  }
}
