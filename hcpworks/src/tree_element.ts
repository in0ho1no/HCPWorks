
export class ModuleTreeElement {
  // 子要素を保持できるようにする
  private _children: ModuleTreeElement[];
  // 親要素を保持できるようにする
  private _parent: ModuleTreeElement | undefined | null;

  constructor(
    public name: string,
    public content: string[],
  ) {
    this._children = [];
  }
  
  // 親要素を返すgetter
  get parent(): ModuleTreeElement | undefined | null {
    return this._parent;
  }
  
  // 子要素を返すgetter
  get children(): ModuleTreeElement[] {
    return this._children;
  }
  
  addChild(child: ModuleTreeElement) {
    // 既存の親要素を削除
    child.parent?.removeChild(child);
    // 子として追加
    this._children.push(child);
    // 自身を親とする
    child._parent = this;
  }
  
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
