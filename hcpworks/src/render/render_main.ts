import * as vscode from 'vscode';

import { ParseInfo4Render } from '../parse/parse_info_4_render';
import { BaseLineProcessor } from '../parse/line_info_list_base';
import { ProcessLineProcessor } from '../parse/line_info_list_process';
import { DataLineProcessor } from '../parse/line_info_list_data';

import { LineTypeDefine, LineTypeEnum } from '../parse/line_define';
import { LineInfo } from '../parse/line_info';
import { LineLevel } from '../parse/line_level';
import { Wire, Process2Data } from '../parse/wire';

import { DataInfo } from '../parse/data_info';

import { DiagramDefine } from './render_define';
import { DiagramElement } from './diagram_element';
import { SvgFigureDefine } from './svg_figure_define';
import { SvgOperator } from './svg_figure_if';
import { SvgFigureText } from './svg_figure_text';
import { SvgFigureLines } from './svg_figure_line';
import { SvgFigureParts } from './svg_figure_parts';



export class SVGRenderer {

  private _name: string;
  private _processLines: ProcessLineProcessor;
  private _dataLines: DataLineProcessor;

  private _svgOperator: SvgOperator;
  private _svgText: string[];

  private _processElements: DiagramElement[];
  private _dataElements: DiagramElement[];

  private _svgWidth: number;
  private _svgHeight: number;
  private _svgBgColor: string;

  constructor(name: string, parseInfo4Render: ParseInfo4Render) {
    this._name = name;
    this._processLines = parseInfo4Render.getProcessLines();
    this._dataLines = parseInfo4Render.getDataLines();

    this._svgOperator = new SvgOperator();
    this._svgText = [];

    this._processElements = [];
    this._dataElements = [];

    this._svgWidth = 0;
    this._svgHeight = 0;
    this._svgBgColor = DiagramDefine.DEFAULT_BG_COLOR;
  }

  /**
   * パースされた要素をSVGとして描画する
   * 
   * @returns SVG文字列
   */
  render(): string {
    const startX = DiagramDefine.IMG_MARGIN;
    const startY = DiagramDefine.IMG_MARGIN;

    // タイトル部を描画
    const titleX = startX - SvgFigureDefine.CIRCLE_R;
    const [titleEndX, titleEndY, titleSvgText] = this.setTitle(titleX, startY);
    this._svgText.push(titleSvgText);

    // 処理部を描画
    this._processElements = this.setElements(startX, titleEndY, this._processLines);
    const [processEndX, processEndY] = this.renderProcess();

    // 処理部からの水平線を描画
    const exitFromProcessEndX = this.renderLineExitFromProcess(processEndX);

    // データ部を描画
    const dataStartX = Math.max(processEndX, exitFromProcessEndX) + DiagramDefine.LEVEL_SHIFT;
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
  setTitle(startX: number, startY: number): [number, number, string] {
    // タイトル部を描画する
    const titleString = "Name: " + this._name;
    const [end_x, svgStringText] = SvgFigureText.drawString(startX, startY, titleString, 150);
    const end_y = startY + DiagramDefine.LEVEL_SHIFT;

    // 描画結果を返す
    const marginX = end_x + DiagramDefine.IMG_MARGIN;
    const marginY = end_y + DiagramDefine.IMG_MARGIN;
    return [marginX, marginY, svgStringText];
  }

  /**
   * 各要素の配置を計算して保持する
   * 
   * @param startX 描画開始位置 X座標
   * @param startY 描画開始位置 Y座標
   * @returns 配置を保持した各要素からなる配列
   */
  setElements(startX: number, startY: number, lineProcessor: BaseLineProcessor): DiagramElement[] {
    const elementList: DiagramElement[] = [];

    for (const lineInfo of lineProcessor.getLineInfoList()) {
      const element = new DiagramElement(lineInfo);

      const normalizeLevel = lineInfo.getLevel() - lineProcessor.getMinLevel();
      element.setX(startX + normalizeLevel * DiagramDefine.LEVEL_SHIFT);
      element.setY(startY + elementList.length * DiagramDefine.LEVEL_SHIFT);
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
  renderProcess(): [number, number] {
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
      const isLevelStarting = (nowElementBeforeLineNo === LineInfo.DEFAULT_VALUE);

      // 直前の要素まで線を引く
      if (!isLevelStarting) {
        const beforeElement = this._processElements[nowElementBeforeLineNo];

        const beforeElementPosBottom = beforeElement.getY() + SvgFigureDefine.CIRCLE_R;
        const nowElementPosTop = nowElement.getY() - SvgFigureDefine.CIRCLE_R;
        const lineLength = nowElementPosTop - beforeElementPosBottom;
        svgText = SvgFigureLines.drawLineV(nowElement.getX(), beforeElementPosBottom, lineLength);
        this._svgText.push(svgText);
      }

      // 始点の追加
      const normalizeNowLevel = nowElement.getLineInfo().getLevel() - this._processLines.getMinLevel();
      const isLevelMin = normalizeNowLevel === LineLevel.LEVEL_MIN;
      if (isLevelStarting && isLevelMin) {
        svgText = SvgFigureLines.drawLevelStart(nowElement.getX(), nowElement.getY());
        this._svgText.push(svgText);
      }

      // 終点の追加
      if (nowElement.getLineInfo().getNextLineNo() === LineInfo.DEFAULT_VALUE) {
        if (nowElement.getLineInfo().getType().type_value === LineTypeDefine.get_format_by_type(LineTypeEnum.RETURN).type_value) {
          // \returnは図として終点を描画する
          // パス
        } else {
          svgText = SvgFigureLines.drawLevelEnd(nowElement.getX(), nowElement.getY());
          this._svgText.push(svgText);
        }
      }

      // レベル下げの追加
      if (isLevelStarting && !isLevelMin) {
        svgText = SvgFigureLines.drawLevelStep(nowElement.getX(), nowElement.getY());
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
  private renderLineExitFromProcess(processEndX: number): number {
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
    const processInOutLine = (element: DiagramElement, dataInfoList: DataInfo[], isInData: boolean): void => {
      // 種別(入力・出力)に応じた線の描画
      for (const dataInfo of dataInfoList) {
        // 種別に応じた情報の更新
        let offsetY: number;
        let drawMethod: (x: number, y: number, length: number, color: string) => string;

        if (isInData === true) {
          offsetY = -5;
          drawMethod = SvgFigureLines.drawArrowL;
        } else {
          offsetY = 5;
          drawMethod = SvgFigureLines.drawLineH;
        }

        // 水平線の始点と終点を決定
        const wireYPos = element.getY() + offsetY;
        const wireH = new Wire(
          { x: element.getEndX(), y: wireYPos },
          { x: processEndX + DiagramDefine.IMG_MARGIN + offsetX, y: wireYPos }
        );

        // 水平線を保持
        const connectWireP2D = new Process2Data();
        connectWireP2D.exitFromProcess = wireH;
        dataInfo.connectLine = connectWireP2D;

        // 線の色を保持
        dataInfo.connectLine.color = DiagramDefine.COLOR_TABLE[colorIndex];
        colorIndex = (colorIndex + 1) % DiagramDefine.COLOR_TABLE.length;

        // 線を描画
        const svgText = drawMethod(wireH.start.x, wireH.start.y, wireH.wireWidth(), dataInfo.connectLine.color);
        this._svgText.push(svgText);

        // 描画情報を更新
        offsetX += DiagramDefine.LINE_OFFSET;
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
      if (normalizeNowLevel === LineLevel.LEVEL_MIN) {
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
  private renderData(): [number, number] {
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
      const isLevelMin = (normalizeLevel === LineLevel.LEVEL_MIN);

      // 直前の要素の有無を保持する
      const beforeLineNo = dataLineInfo.getBeforeLineNo();
      const isLevelStarting = (beforeLineNo === LineInfo.DEFAULT_VALUE);

      // 最小レベルでは垂直線による結合を行わない
      if (!isLevelMin) {

        // 始点でなければ直前の要素があるので結合する
        if (!isLevelStarting) {
          const beforeElement = this._dataElements[beforeLineNo];

          // 垂直線を描画する
          const beforeElementPosBottom = beforeElement.getY() + SvgFigureDefine.CIRCLE_R;
          const dataElementPosTop = dataElement.getY() - SvgFigureDefine.CIRCLE_R;
          const lineLength = dataElementPosTop - beforeElementPosBottom;
          svgText = SvgFigureLines.drawLineV(dataElement.getX(), beforeElementPosBottom, lineLength);
          this._svgText.push(svgText);
        }
      }

      // レベル下げの追加
      if (!isLevelMin && isLevelStarting) {
        svgText = SvgFigureLines.drawLevelStep(dataElement.getX(), dataElement.getY());
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
  private renderLineEnterToData(): void {

    /**
     * データ部への入出力線を描画する
     * 
     * @param dataElement データ部の要素
     * @param processInfo 処理部の情報
     * @param dataInfoList 入出力情報のリスト
     * @param isInData 入力値であるか否か
     */
    const dataInOutLine = (dataElement: DiagramElement, processInfo: LineInfo, dataInfoList: DataInfo[], isInData: boolean): void => {
      // 種別(入力・出力)に応じた線の描画
      for (const dataInfo of dataInfoList) {
        // 同じデータ名のみ対象とする
        if (dataElement.getLineInfo().getTextLessTypeIO() !== dataInfo.name) {
          continue;
        }

        // 種別に応じた情報の更新
        let offsetY: number;
        let drawLineMethod: (x: number, y: number, length: number, color: string) => string;
        let drawDataInOutMethod: (x: number, y: number) => string;
        if (isInData === true) {
          offsetY = +5;
          drawLineMethod = SvgFigureLines.drawLineH;
          drawDataInOutMethod = SvgFigureParts.drawFigureDataFuncIn;
        } else {
          offsetY = -5;
          drawLineMethod = SvgFigureLines.drawArrowR;
          drawDataInOutMethod = SvgFigureParts.drawFigureDataFuncOut;
        }

        const normalizeLevel = processInfo.getLevel() - this._processLines.getMinLevel();
        if (normalizeLevel === LineLevel.LEVEL_MIN) {
          // 関数への入出力は接続線で表現しない
          const svgText = drawDataInOutMethod(dataElement.getX(), dataElement.getY());
          this._svgText.push(svgText);
        } else {
          // 処理部からの入出力線が存在しなければ何もしない
          const connextLine = dataInfo.connectLine;
          if (!connextLine) { continue; }
          const exitFromProcess = connextLine.exitFromProcess;
          if (!exitFromProcess) { continue; }

          // 水平線の始点と終点を決定
          const wireYPos = dataElement.getY() + offsetY;
          const wireH = new Wire(
            { x: exitFromProcess.end.x, y: wireYPos },
            { x: dataElement.getX() - SvgFigureDefine.CIRCLE_R, y: wireYPos }
          );
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
  private connect_process2data(): void {
    // 処理部とデータ部の入出力線を結ぶ
    const process2data = (dataInfoList: DataInfo[]): void => {
      for (const dataInfo of dataInfoList) {
        const connextLine = dataInfo.connectLine;
        if (!connextLine) { continue; }
        const exitFromProcess = connextLine.exitFromProcess;
        if (!exitFromProcess) { continue; }
        const enterToData = connextLine.enterToData;
        if (!enterToData) { continue; }

        // 画像の上部から下部に向かって描画するように更新
        const start_y = Math.min(enterToData.start.y, exitFromProcess.end.y);
        const end_y = Math.max(enterToData.start.y, exitFromProcess.end.y);

        // 垂直線の始点と終点を決定
        const wireV = new Wire(
          { x: enterToData.start.x, y: start_y },
          { x: enterToData.start.x, y: end_y }
        );
        connextLine.betweenProcessData = wireV;

        // 線を描画
        const svgText = SvgFigureLines.drawLineV(wireV.start.x, wireV.start.y, wireV.wireHeight(), connextLine.color);
        this._svgText.push(svgText);
      }
    };

    for (const processElement of this._processElements) {
      // 関数への入出力は接続線で表現しない
      const processLineInfo = processElement.getLineInfo();
      const normalizeLevel = processLineInfo.getLevel() - this._processLines.getMinLevel();
      if (normalizeLevel === LineLevel.LEVEL_MIN) {
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
  private renderFinish(): string {
    // SVGの描画を終える
    const margin = 50;
    const width = this._svgWidth;
    const height = this._svgHeight + margin;
    const color = this._svgBgColor;

    this._svgText.unshift(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" style="background-color: #${color}">`);
    this._svgText.splice(1, 0, `<rect x="0" y="0" width="${width}" height="${height}" fill="#${color}" stroke="#${color}"/>`);
    this._svgText.push("</svg>");
    return this._svgText.join(SvgFigureDefine.LINE_BREAK);
  }

  getSvgWidth(): number { return this._svgWidth; }
  getSvgHeight(): number { return this._svgHeight; }

  /**
   * Previewの背景色を設定する
   * 
   * @param bgColor 設定する背景色 (#RRGGBBまたはRRGGBB形式)
 * @returns 設定の成功・失敗を示すboolean値
   */
  setSvgBgColor(bgColor: string) {
    // undefinedのチェック
    if (!bgColor) {
      vscode.window.showErrorMessage(`背景色が指定されていません。`);
      return false;
    }

    // 色文字列の正規化（前後の空白を削除）
    const normalizedColor = bgColor.trim();

    // 正規表現による入力のパターンチェック
    // パターン1: #で始まる場合、#の後に6桁の16進数が続く
    // パターン2: #がない場合、6桁の16進数のみ
    const validFormat1 = /^#[0-9A-Fa-f]{6}$/;  // #RRGGBB
    const validFormat2 = /^[0-9A-Fa-f]{6}$/;   // RRGGBB
    let colorValue: string;
    if (validFormat1.test(normalizedColor)) {
      // #RRGGBB形式の場合、#を除去
      colorValue = normalizedColor.substring(1);
    } else if (validFormat2.test(normalizedColor)) {
      // RRGGBB形式の場合はそのまま
      colorValue = normalizedColor;
    } else {
      // どちらの形式にも合致しない場合
      vscode.window.showErrorMessage(
        `6桁の16進数形式の色を指定してください。例: #RRGGBB または RRGGBB。現在の値: ${normalizedColor}`
      );
      return false;
    }

    // 値更新
    this._svgBgColor = colorValue;
    console.log(`背景色を更新しました。現在の値: ${this._svgBgColor}`);
    return true;
  }

  /**
   * 現在設定されている背景色を取得する
   * 
   * @returns 背景色の16進数表現（#RRGGBB形式）
   */
  getSvgBgColor(): string {
    // 未設定の場合はデフォルト値を返す
    if (!this._svgBgColor) {
      return DiagramDefine.DEFAULT_BG_COLOR;
    }
    return this._svgBgColor;
  }

}
