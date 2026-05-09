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
exports.SVGRenderer = void 0;
const vscode = __importStar(require("vscode"));
const line_define_1 = require("../parse/line_define");
const line_info_1 = require("../parse/line_info");
const line_level_1 = require("../parse/line_level");
const wire_1 = require("../parse/wire");
const render_define_1 = require("./render_define");
const diagram_element_1 = require("./diagram_element");
const svg_figure_define_1 = require("./svg_figure_define");
const svg_figure_if_1 = require("./svg_figure_if");
const svg_figure_text_1 = require("./svg_figure_text");
const svg_figure_line_1 = require("./svg_figure_line");
const svg_figure_parts_1 = require("./svg_figure_parts");
class SVGRenderer {
    _name;
    _processLines;
    _dataLines;
    _svgOperator;
    _svgText;
    _processElements;
    _dataElements;
    _svgWidth;
    _svgHeight;
    _svgBgColor;
    _svgWireColorTable;
    constructor(name, parseInfo4Render) {
        this._name = name;
        this._processLines = parseInfo4Render.getProcessLines();
        this._dataLines = parseInfo4Render.getDataLines();
        this._svgOperator = new svg_figure_if_1.SvgOperator();
        this._svgText = [];
        this._processElements = [];
        this._dataElements = [];
        this._svgWidth = 0;
        this._svgHeight = 0;
        this._svgBgColor = render_define_1.DiagramDefine.DEFAULT_BG_COLOR;
        this._svgWireColorTable = render_define_1.DiagramDefine.WIRE_COLOR_TABLE;
    }
    /**
     * パースされた要素をSVGとして描画する
     *
     * @returns SVG文字列
     */
    render() {
        const startX = render_define_1.DiagramDefine.IMG_MARGIN;
        const startY = render_define_1.DiagramDefine.IMG_MARGIN;
        // タイトル部を描画
        const titleX = startX - svg_figure_define_1.SvgFigureDefine.CIRCLE_R;
        const [titleEndX, titleEndY, titleSvgText] = this.setTitle(titleX, startY);
        this._svgText.push(titleSvgText);
        // 処理部を描画
        this._processElements = this.setElements(startX, titleEndY, this._processLines);
        const [processEndX, processEndY] = this.renderProcess();
        // 処理部からの水平線を描画
        const exitFromProcessEndX = this.renderLineExitFromProcess(processEndX);
        // データ部を描画
        const dataStartX = Math.max(processEndX, exitFromProcessEndX) + render_define_1.DiagramDefine.LEVEL_SHIFT;
        this._dataElements = this.setElements(dataStartX, titleEndY, this._dataLines);
        const [dataEndX, dataEndY] = this.renderData();
        // データ部への水平線を描画
        this.renderLineEnterToData();
        // 処理部とデータ部を結ぶ
        this.connect_process2data();
        // 描画終了
        this._svgWidth = Math.max(titleEndX, processEndX, dataEndX);
        this._svgHeight = Math.max(titleEndY, processEndY, dataEndY);
        return this.renderFinish();
    }
    /**
     * タイトル部を描画する
     *
     * @param startX タイトル描画開始位置 X座標
     * @param startY タイトル描画開始位置 Y座標
     * @returns [終了位置のX座標, 終了位置のY座標, SVG文字列]
     */
    setTitle(startX, startY) {
        // タイトル部を描画する
        const titleString = "Name: " + this._name;
        const [end_x, svgStringText] = svg_figure_text_1.SvgFigureText.drawString(startX, startY, titleString, 150);
        const end_y = startY + render_define_1.DiagramDefine.LEVEL_SHIFT;
        // 描画結果を返す
        const marginX = end_x + render_define_1.DiagramDefine.IMG_MARGIN;
        const marginY = end_y + render_define_1.DiagramDefine.IMG_MARGIN;
        return [marginX, marginY, svgStringText];
    }
    /**
     * 各要素の配置を計算して保持する
     *
     * @param startX 描画開始位置 X座標
     * @param startY 描画開始位置 Y座標
     * @returns 配置を保持した各要素からなる配列
     */
    setElements(startX, startY, lineProcessor) {
        const elementList = [];
        for (const lineInfo of lineProcessor.getLineInfoList()) {
            const element = new diagram_element_1.DiagramElement(lineInfo);
            const normalizeLevel = lineInfo.getLevel() - lineProcessor.getMinLevel();
            element.setX(startX + normalizeLevel * render_define_1.DiagramDefine.LEVEL_SHIFT);
            element.setY(startY + elementList.length * render_define_1.DiagramDefine.LEVEL_SHIFT);
            elementList.push(element);
        }
        return elementList;
    }
    /**
     * 処理部を描画する
     *
     * @param startX 処理部描画開始位置 X座標
     * @param startY 処理部描画開始位置 Y座標
     * @returns [終了位置のX座標, 終了位置のY座標]
     */
    renderProcess() {
        let processHeight = 0;
        let processWidth = 0;
        for (const nowElement of this._processElements) {
            // 共通して利用する情報を保持
            // 種別に応じた図形とテキストを描画
            let [endX, svgText] = this._svgOperator.drawFigureMethod(nowElement);
            nowElement.setEndX(endX);
            this._svgText.push(svgText);
            // ステップ間の垂直線の追加
            const nowElementBeforeLineNo = nowElement.getLineInfo().getBeforeLineNo();
            const isLevelStarting = (nowElementBeforeLineNo === line_info_1.LineInfo.DEFAULT_VALUE);
            // 直前の要素まで線を引く
            if (!isLevelStarting) {
                const beforeElement = this._processElements[nowElementBeforeLineNo];
                const beforeElementPosBottom = beforeElement.getY() + svg_figure_define_1.SvgFigureDefine.CIRCLE_R;
                const nowElementPosTop = nowElement.getY() - svg_figure_define_1.SvgFigureDefine.CIRCLE_R;
                const lineLength = nowElementPosTop - beforeElementPosBottom;
                svgText = svg_figure_line_1.SvgFigureLines.drawLineV(nowElement.getX(), beforeElementPosBottom, lineLength);
                this._svgText.push(svgText);
            }
            // 始点の追加
            const normalizeNowLevel = nowElement.getLineInfo().getLevel() - this._processLines.getMinLevel();
            const isLevelMin = normalizeNowLevel === line_level_1.LineLevel.LEVEL_MIN;
            if (isLevelStarting && isLevelMin) {
                svgText = svg_figure_line_1.SvgFigureLines.drawLevelStart(nowElement.getX(), nowElement.getY());
                this._svgText.push(svgText);
            }
            // 終点の追加
            if (nowElement.getLineInfo().getNextLineNo() === line_info_1.LineInfo.DEFAULT_VALUE) {
                if (nowElement.getLineInfo().getType().type_value === line_define_1.LineTypeDefine.get_format_by_type(line_define_1.LineTypeEnum.RETURN).type_value) {
                    // \returnは図として終点を描画する
                    // パス
                }
                else {
                    svgText = svg_figure_line_1.SvgFigureLines.drawLevelEnd(nowElement.getX(), nowElement.getY());
                    this._svgText.push(svgText);
                }
            }
            // レベル下げの追加
            if (isLevelStarting && !isLevelMin) {
                svgText = svg_figure_line_1.SvgFigureLines.drawLevelStep(nowElement.getX(), nowElement.getY());
                this._svgText.push(svgText);
            }
            // 処理部の高さと幅を更新する
            processWidth = Math.max(processWidth, nowElement.getEndX());
            processHeight = Math.max(processHeight, nowElement.getY());
        }
        return [processWidth, processHeight];
    }
    /**
     * 処理部からの入出力線を描画する
     *
     * @param processEndX 処理部描画終了位置 X座標
     * @returns 入出力線の終了位置 X座標
     */
    renderLineExitFromProcess(processEndX) {
        let offsetX = 0;
        let exitEndX = 0;
        let colorIndex = 0;
        /**
         * 処理部からの入出力線を描画する
         *
         * @param element 処理部の要素
         * @param dataInfoList 入出力情報のリスト
         * @param isInData 入力値であるか否か
         */
        const processInOutLine = (element, dataInfoList, isInData) => {
            // 種別(入力・出力)に応じた線の描画
            for (const dataInfo of dataInfoList) {
                // 種別に応じた情報の更新
                let offsetY;
                let drawMethod;
                if (isInData === true) {
                    offsetY = -5;
                    drawMethod = svg_figure_line_1.SvgFigureLines.drawArrowL;
                }
                else {
                    offsetY = 5;
                    drawMethod = svg_figure_line_1.SvgFigureLines.drawLineH;
                }
                // 水平線の始点と終点を決定
                const wireYPos = element.getY() + offsetY;
                const wireH = new wire_1.Wire({ x: element.getEndX(), y: wireYPos }, { x: processEndX + render_define_1.DiagramDefine.IMG_MARGIN + offsetX, y: wireYPos });
                // 水平線を保持
                const connectWireP2D = new wire_1.Process2Data();
                connectWireP2D.exitFromProcess = wireH;
                dataInfo.connectLine = connectWireP2D;
                // 線の色を保持
                dataInfo.connectLine.color = this._svgWireColorTable[colorIndex];
                colorIndex = (colorIndex + 1) % this._svgWireColorTable.length;
                // 線を描画
                const svgText = drawMethod(wireH.start.x, wireH.start.y, wireH.wireWidth(), dataInfo.connectLine.color);
                this._svgText.push(svgText);
                // 描画情報を更新
                offsetX += render_define_1.DiagramDefine.LINE_OFFSET;
                exitEndX = Math.max(exitEndX, wireH.end.x);
            }
        };
        for (const processElement of this._processElements) {
            // 入出力がなければ何もしない
            const processLineInfo = processElement.getLineInfo();
            const processInOutData = processLineInfo.getInOutData();
            if (processInOutData.getInDataList().length === 0
                && processInOutData.getOutDataList().length === 0) {
                continue;
            }
            // 関数への入出力は接続線で表現しない
            const normalizeNowLevel = processLineInfo.getLevel() - this._processLines.getMinLevel();
            if (normalizeNowLevel === line_level_1.LineLevel.LEVEL_MIN) {
                continue;
            }
            // 入出力線を描画
            processInOutLine(processElement, processInOutData.getInDataList(), true);
            processInOutLine(processElement, processInOutData.getOutDataList(), false);
        }
        return exitEndX;
    }
    /**
     * データ部を描画する
     *
     * @returns [終了位置のX座標, 終了位置のY座標]
     */
    renderData() {
        // データ部を描画する
        let dataHeight = 0;
        let dataWidth = 0;
        for (const dataElement of this._dataElements) {
            // 種別に応じた図形とテキストを描画
            let [endX, svgText] = this._svgOperator.drawFigureMethod(dataElement);
            dataElement.setEndX(endX);
            this._svgText.push(svgText);
            // 最小レベルか否かの判定を保持する
            const dataLineInfo = dataElement.getLineInfo();
            const normalizeLevel = dataLineInfo.getLevel() - this._dataLines.getMinLevel();
            const isLevelMin = (normalizeLevel === line_level_1.LineLevel.LEVEL_MIN);
            // 直前の要素の有無を保持する
            const beforeLineNo = dataLineInfo.getBeforeLineNo();
            const isLevelStarting = (beforeLineNo === line_info_1.LineInfo.DEFAULT_VALUE);
            // 最小レベルでは垂直線による結合を行わない
            if (!isLevelMin) {
                // 始点でなければ直前の要素があるので結合する
                if (!isLevelStarting) {
                    const beforeElement = this._dataElements[beforeLineNo];
                    // 垂直線を描画する
                    const beforeElementPosBottom = beforeElement.getY() + svg_figure_define_1.SvgFigureDefine.CIRCLE_R;
                    const dataElementPosTop = dataElement.getY() - svg_figure_define_1.SvgFigureDefine.CIRCLE_R;
                    const lineLength = dataElementPosTop - beforeElementPosBottom;
                    svgText = svg_figure_line_1.SvgFigureLines.drawLineV(dataElement.getX(), beforeElementPosBottom, lineLength);
                    this._svgText.push(svgText);
                }
            }
            // レベル下げの追加
            if (!isLevelMin && isLevelStarting) {
                svgText = svg_figure_line_1.SvgFigureLines.drawLevelStep(dataElement.getX(), dataElement.getY());
                this._svgText.push(svgText);
            }
            // データ部の高さと幅を更新する
            dataWidth = Math.max(dataWidth, endX);
            dataHeight = Math.max(dataHeight, dataElement.getY());
        }
        return [dataWidth, dataHeight];
    }
    /**
     * データ部への入出力線を描画する
     */
    renderLineEnterToData() {
        /**
         * データ部への入出力線を描画する
         *
         * @param dataElement データ部の要素
         * @param processInfo 処理部の情報
         * @param dataInfoList 入出力情報のリスト
         * @param isInData 入力値であるか否か
         */
        const dataInOutLine = (dataElement, processInfo, dataInfoList, isInData) => {
            // 種別(入力・出力)に応じた線の描画
            for (const dataInfo of dataInfoList) {
                // 同じデータ名のみ対象とする
                if (dataElement.getLineInfo().getTextLessTypeIO() !== dataInfo.name) {
                    continue;
                }
                // 種別に応じた情報の更新
                let offsetY;
                let drawLineMethod;
                let drawDataInOutMethod;
                if (isInData === true) {
                    offsetY = +5;
                    drawLineMethod = svg_figure_line_1.SvgFigureLines.drawLineH;
                    drawDataInOutMethod = svg_figure_parts_1.SvgFigureParts.drawFigureDataFuncIn;
                }
                else {
                    offsetY = -5;
                    drawLineMethod = svg_figure_line_1.SvgFigureLines.drawArrowR;
                    drawDataInOutMethod = svg_figure_parts_1.SvgFigureParts.drawFigureDataFuncOut;
                }
                const normalizeLevel = processInfo.getLevel() - this._processLines.getMinLevel();
                if (normalizeLevel === line_level_1.LineLevel.LEVEL_MIN) {
                    // 関数への入出力は接続線で表現しない
                    const svgText = drawDataInOutMethod(dataElement.getX(), dataElement.getY());
                    this._svgText.push(svgText);
                }
                else {
                    // 処理部からの入出力線が存在しなければ何もしない
                    const connextLine = dataInfo.connectLine;
                    if (!connextLine) {
                        continue;
                    }
                    const exitFromProcess = connextLine.exitFromProcess;
                    if (!exitFromProcess) {
                        continue;
                    }
                    // 水平線の始点と終点を決定
                    const wireYPos = dataElement.getY() + offsetY;
                    const wireH = new wire_1.Wire({ x: exitFromProcess.end.x, y: wireYPos }, { x: dataElement.getX() - svg_figure_define_1.SvgFigureDefine.CIRCLE_R, y: wireYPos });
                    connextLine.enterToData = wireH;
                    // 線を描画
                    const svgText = drawLineMethod(wireH.start.x, wireH.start.y, wireH.wireWidth(), connextLine.color);
                    this._svgText.push(svgText);
                }
            }
        };
        // データ部のデータを順に描画する
        for (const dataElement of this._dataElements) {
            // 処理部へ存在する入出力を基準に描画する
            for (const processElement of this._processElements) {
                const processLineInfo = processElement.getLineInfo();
                const processInOutData = processLineInfo.getInOutData();
                dataInOutLine(dataElement, processLineInfo, processInOutData.getInDataList(), true);
                dataInOutLine(dataElement, processLineInfo, processInOutData.getOutDataList(), false);
            }
        }
    }
    /**
     * 処理部とデータ部の入出力線を結ぶ
     *
     * @param dataInfoList データ情報のリスト
     */
    connect_process2data() {
        // 処理部とデータ部の入出力線を結ぶ
        const process2data = (dataInfoList) => {
            for (const dataInfo of dataInfoList) {
                const connextLine = dataInfo.connectLine;
                if (!connextLine) {
                    continue;
                }
                const exitFromProcess = connextLine.exitFromProcess;
                if (!exitFromProcess) {
                    continue;
                }
                const enterToData = connextLine.enterToData;
                if (!enterToData) {
                    continue;
                }
                // 画像の上部から下部に向かって描画するように更新
                const start_y = Math.min(enterToData.start.y, exitFromProcess.end.y);
                const end_y = Math.max(enterToData.start.y, exitFromProcess.end.y);
                // 垂直線の始点と終点を決定
                const wireV = new wire_1.Wire({ x: enterToData.start.x, y: start_y }, { x: enterToData.start.x, y: end_y });
                connextLine.betweenProcessData = wireV;
                // 線を描画
                const svgText = svg_figure_line_1.SvgFigureLines.drawLineV(wireV.start.x, wireV.start.y, wireV.wireHeight(), connextLine.color);
                this._svgText.push(svgText);
            }
        };
        for (const processElement of this._processElements) {
            // 関数への入出力は接続線で表現しない
            const processLineInfo = processElement.getLineInfo();
            const normalizeLevel = processLineInfo.getLevel() - this._processLines.getMinLevel();
            if (normalizeLevel === line_level_1.LineLevel.LEVEL_MIN) {
                continue;
            }
            const processInOutData = processLineInfo.getInOutData();
            process2data(processInOutData.getInDataList());
            process2data(processInOutData.getOutDataList());
        }
    }
    /**
     * SVGの描画を終える
     *
     * @returns SVG文字列
     */
    renderFinish() {
        // SVGの描画を終える
        const margin = 50;
        const width = this._svgWidth;
        const height = this._svgHeight + margin;
        const color = this._svgBgColor;
        this._svgText.unshift(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" style="background-color: #${color}">`);
        this._svgText.splice(1, 0, `<rect x="0" y="0" width="${width}" height="${height}" fill="#${color}" stroke="#${color}"/>`);
        this._svgText.push("</svg>");
        return this._svgText.join(svg_figure_define_1.SvgFigureDefine.LINE_BREAK);
    }
    getSvgWidth() { return this._svgWidth; }
    getSvgHeight() { return this._svgHeight; }
    /**
     * Previewの背景色を設定する
     *
     * @param bgColor 設定する背景色 (#RRGGBBまたはRRGGBB形式)
     * @returns 現在のインスタンス
     */
    setSvgBgColor(bgColor) {
        const validatedColor = this.checkColorFormat(bgColor);
        if (validatedColor) {
            this._svgBgColor = validatedColor;
        }
        else {
            vscode.window.showWarningMessage(`無効な色形式です。設定は変更されませんでした。`);
        }
        return this;
    }
    /**
     * 現在設定されている背景色を取得する
     *
     * @returns 背景色の16進数表現(RRGGBB形式)
     */
    getSvgBgColor() {
        let bgColor;
        if (!this._svgBgColor) {
            bgColor = render_define_1.DiagramDefine.DEFAULT_BG_COLOR;
        }
        else {
            bgColor = this._svgBgColor;
        }
        return bgColor.replace('#', '');
    }
    /**
     * 線の色のテーブルを設定する
     *
     * @param wireColorTable 設定する線の色のテーブル (#RRGGBBまたはRRGGBB形式)
     * @returns 現在のインスタンス
     */
    setWireColorTable(wireColorTable) {
        if (wireColorTable.length === 0) {
            vscode.window.showWarningMessage(`有効な色テーブルが指定されていません。設定は変更されませんでした。`);
            return this;
        }
        // 各色を検証・正規化する (無効な色はnullになる)
        const validatedColors = wireColorTable.map(color => this.checkColorFormat(color));
        // 無効な色を除外する
        const validColorTable = validatedColors.filter(color => color !== null);
        if (validColorTable.length === 0) {
            vscode.window.showWarningMessage(`有効な色が指定されていません。設定は変更されませんでした。`);
        }
        else {
            this._svgWireColorTable = validColorTable;
        }
        return this;
    }
    /**
     * 現在設定されている線の色テーブルを取得する
     *
     * @returns 線の色テーブル(RRGGBB形式)
     */
    getWireColorTable() {
        let wireColorTable;
        if (!this._svgWireColorTable || this._svgWireColorTable.length === 0) {
            wireColorTable = render_define_1.DiagramDefine.WIRE_COLOR_TABLE;
        }
        else {
            wireColorTable = this._svgWireColorTable;
        }
        return wireColorTable.map(color => color.replace('#', ''));
    }
    /**
     * 色指定のフォーマットをチェックする
     *
     * @param color チェックする色指定 (#RRGGBBまたはRRGGBB形式)
     * @returns 問題なければ色指定の16進数表現(RRGGBB形式)、問題があればnull
     */
    checkColorFormat(color) {
        // nullまたはundefinedのチェック
        if (color === null) {
            return null;
        }
        // 色文字列の正規化(前後の空白を削除)
        const normalizedColor = color.trim();
        // 正規表現による入力のパターンチェック: #で始まる場合、#の後に6桁の16進数が続く
        let validFormat = /^#([0-9A-Fa-f]{6})$/; // #RRGGBB
        let match = normalizedColor.match(validFormat);
        if (match) {
            return match[1].toUpperCase();
        }
        // 正規表現による入力のパターンチェック: #がない場合、6桁の16進数のみ
        validFormat = /^([0-9A-Fa-f]{6})$/; // RRGGBB
        match = normalizedColor.match(validFormat);
        if (match) {
            return match[1].toUpperCase();
        }
        // どちらの形式にも合致しない場合
        vscode.window.showErrorMessage(`6桁の16進数形式の色を指定してください。例: #RRGGBB または RRGGBB。現在の値: ${normalizedColor}`);
        return null;
    }
}
exports.SVGRenderer = SVGRenderer;
//# sourceMappingURL=render_main.js.map