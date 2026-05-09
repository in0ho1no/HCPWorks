"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagramElement = void 0;
class DiagramElement {
    _line_info;
    _x;
    _y;
    _endX;
    constructor(line_info) {
        this._line_info = line_info;
        this._x = 0;
        this._y = 0;
        this._endX = 0;
    }
    getX() { return this._x; }
    setX(x) { this._x = x; }
    getY() { return this._y; }
    setY(y) { this._y = y; }
    getEndX() { return this._endX; }
    setEndX(x) { this._endX = x; }
    getLineInfo() { return this._line_info; }
}
exports.DiagramElement = DiagramElement;
//# sourceMappingURL=diagram_element.js.map