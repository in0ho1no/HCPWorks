"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgOperator = void 0;
const line_define_1 = require("../parse/line_define");
const svg_figure_parts_1 = require("./svg_figure_parts");
/**
 * 図形描画を管理するクラス
 */
class SvgOperator {
    _figureMethodMap;
    /**
     * 初期化メソッド
     */
    constructor() {
        // 種別値と描画メソッドのマッピングテーブルを構築
        this._figureMethodMap = new Map([
            [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.NORMAL).type_value, svg_figure_parts_1.SvgFigureParts.drawFigureNormal],
            [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.FORK).type_value, svg_figure_parts_1.SvgFigureParts.drawFigureFork],
            [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.REPEAT).type_value, svg_figure_parts_1.SvgFigureParts.drawFigureRepeat],
            [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.MOD).type_value, svg_figure_parts_1.SvgFigureParts.drawFigureMod],
            [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.RETURN).type_value, svg_figure_parts_1.SvgFigureParts.drawFigureReturn],
            [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.TRUE).type_value, svg_figure_parts_1.SvgFigureParts.drawFigureTrue],
            [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.FALSE).type_value, svg_figure_parts_1.SvgFigureParts.drawFigureFalse],
            [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.BRANCH).type_value, svg_figure_parts_1.SvgFigureParts.drawFigureBranch],
            [line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.DATA).type_value, svg_figure_parts_1.SvgFigureParts.drawFigureData],
        ]);
    }
    /**
     * 要素の種別に応じた図形を描画する
     *
     * @param element 描画要素情報
     * @returns 描画した図形の[行の終端位置 , 処理を意味する行のSVG文字列]
     */
    drawFigureMethod(element) {
        // 要素の種別に対応するメソッドを取得
        const typeValue = element.getLineInfo().getType().type_value;
        const drawMethod = this._figureMethodMap.get(typeValue);
        // メソッドが見つかれば実行する
        if (drawMethod) {
            return drawMethod(element.getX(), element.getY(), element.getLineInfo().getTextLessTypeIO());
        }
        // 未対応の種別値の場合
        console.error(`Unsupported LineTypeEnum: ${typeValue}`);
        return [0, ""];
    }
}
exports.SvgOperator = SvgOperator;
//# sourceMappingURL=svg_figure_if.js.map