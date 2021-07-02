import QbfElement, {IQbfSchema} from "../QbfModule/QbfElement"
import QbfFramedElement from "../QbfModule/QbfFramedElement"
import QbForm from "../QbfModule/QbForm"
import QbfPropertyTools from "../QbfModule/QbfPropertyTools"

import {QbfBooleanValue} from "../QbfModule/QbfBoolean"
import QbfBooleanDisplayCheckbox from "../QbfModule/QbfBooleanDisplayCheckbox"

import QbfGridAppendRow from "./QbfGridAppendRow"
import QbfGridColumn from "./QbfGridColumn"
import QbfGridData from "./QbfGridData"
import QbfGridHeader from "./QbfGridHeader"
import QbfGridRow from "./QbfGridRow"

// Naming of element IDs and classes:
//
//  Element: "_qbf"    +    "t"    +    "h/d/f/a"   + "l,c,r,i"
//            prefix        module     vertical pos.   hor. position
//           (QbForm)      (Table)    (header/data/   left,center,right,icon
//                                     footer/append)
//
//        LEFT (static)   Data (scrolled)   RIGHT (static)   ICONS
//        +------------+-------------------+-------------+-------------+
// HEADER | _qbfthl... | _qbfthc....       | _qbfthr.... | _qbfthi.... |
//        +------------+-------------------+-------------+-------------+
// DATA   | _qbftdl... | _qbftdc....       | _qbftdr.... | _qbftdi.... |
//        +------------+-------------------+-------------+-------------+
// FOOTER | _qbftfl... | _qbftfc....       | _qbftfr.... | _qbftfi.... |
//        +------------+-------------------+-------------+-------------+
// APPEND | _qbftal... | _qbftac....       | _qbftar.... | _qbftai.... |
//        +------------+-------------------+-------------+-------------+
//

// ===============================================================
// QbfGrid object definition
// ===============================================================

// ===============================================================
export enum QbfGridMode {
// ===============================================================
  UNKOWN,
  READ_WRITE,
  READ_ONLY,
}

// ===============================================================
export enum QbfGridColumnSortMode {
// ===============================================================
  UNKOWN,
  UP,
  DOWN,
}

// ===============================================================
export default class QbfGridAbstract extends QbfFramedElement {
// ===============================================================
  // **************************************
  // QbfGridAbstract: static
  // **************************************
  public static initialized: boolean = false
  public static lastIndex: number = 0
  public static gridList: QbfGridAbstract[] = []

  // --------------------------------------------------------------
  public static setDivLeftAndTop(element: HTMLElement | null, left: number, top: number): void {
  // --------------------------------------------------------------
    if ( element ) {
      element.style.left = left + "px"
      element.style.top = top + "px"
      element.style.visibility = "visible"
    }
  }

  // --------------------------------------------------------------
  public static getZindex(elem: HTMLElement): (number | null) {
  // --------------------------------------------------------------
    let result: number | null = null
    const zIndex = elem.style.zIndex
    if ( zIndex && zIndex.match(/^[0-9]+$/) != null) {
      result = Number.parseInt(zIndex, 10)
    }
    return result
  }

  // --------------------------------------------------------------
  public static onLoad(index: number): void {
  // --------------------------------------------------------------
    const grid = QbfGridAbstract.gridList[index]
    // - - - - - - - - - - - - - - - - - - - -
    // Put the colum-selectors in foreground
    // - - - - - - - - - - - - - - - - - - - -
    // Calculate z-index of the main div
    let gridZindex = 0
    const elementName = "_qbft" + index
    let element = QbForm.getElementById(elementName)
    while (gridZindex === 0 && element ) {
      const zIndex = QbfGridAbstract.getZindex(element)
      if ( zIndex != null ) {
        gridZindex = zIndex
      } else {
        element = element.parentElement
      }
    }
    // set z-index = gridZindex + 1 for each columSel
    grid.columnMap.forEach( (col: QbfGridColumn) => {
      // header Separator
      let sepElemId = col.header.headerSeparator.getDivId()
      let elem = QbForm.getElementById(sepElemId)
      if (elem) {
        elem.style.zIndex = "" + (gridZindex + 1)
      }
      // filter Separator
      sepElemId = col.header.filterSeparator.getDivId()
      elem = QbForm.getElementById(sepElemId)
      if (elem) {
        elem.style.zIndex = "" + (gridZindex + 1)
      }
    })
    // set z-index = gridZindex + 2 for the mask
    const gridMask = QbForm.getElementById("_qbft_mask_" + index )
    if ( gridMask ) {
      gridMask.style.zIndex = "" + (gridZindex + 2)
    }
    // Set max width
    const elementPath: string = QbForm.convertPathToString(grid.elementPath)
    const elementHtml: HTMLElement | null = QbForm.getElementById(elementPath)
    if (elementHtml) {
      grid.maxWidth = elementHtml.clientWidth
    } else {
      grid.maxWidth = 10000
    }

    grid.updateLayout()
  }

  // --------------------------------------------------------------
  public static onClickAllRowSelector(qbFormId: number, elementPath: string, event: MouseEvent): void {
  // --------------------------------------------------------------
    const qbfBooleanCheckbox = QbForm.getClass("QbfBooleanCheckbox")
    const newStatus = qbfBooleanCheckbox.changeStatus(qbFormId, null, event)
    QbfGridAbstract.changeAllRowSelection(qbFormId, elementPath, newStatus)
  }

  // --------------------------------------------------------------
  public static onKeyPressAllRowSelector(qbFormId: number, elementPath: string, event: KeyboardEvent): void {
  // --------------------------------------------------------------
    if (event.key === " ") {
      event.preventDefault()
      const qbfBooleanCheckbox = QbForm.getClass("QbfBooleanCheckbox")
      const newStatus = qbfBooleanCheckbox.changeStatus(qbFormId, null, event)
      QbfGridAbstract.changeAllRowSelection(qbFormId, elementPath, newStatus)
    }
  }

  // ------------------------------------------------------------------------------
  public static onClickSelectAllRows(parentPath: string, oldValue: QbfBooleanValue, newValue: QbfBooleanValue): void {
  // ------------------------------------------------------------------------------
    const grid = QbForm.getElementFromElementPath(parentPath)[0] as QbfGridAbstract
    grid.data.rowList.forEach( (row: QbfGridRow) => {
      row.select( newValue )
    })
  }

  // **************************************
  // QbfGridAbstract: instance
  // **************************************
  public parent: (typeof QbfElement) | null
  public index: number
  public columnMap: Map<string, QbfGridColumn>
  public columnList: QbfGridColumn[]
  public highlightedCol: number
  public highlightedRow: number
  public data: QbfGridData
  public appendQbfRow: QbfGridAppendRow | null
  public storageModeRequired: string
  public storageMode: string
  // DOM & style
  // style: HTMLStyleElement
  // -- max width
  public maxWidth: number
  // -- sorting
  public sortable: boolean
  public sortedCol: number = -1
  public sortMode: QbfGridColumnSortMode = QbfGridColumnSortMode.UNKOWN
  // -- filters
  public filter: boolean
  // -- row selection
  public hasMultiSelection: boolean = true
  public lastSelectedLine: number  = -1
  // className
  public class: string | null = null
  // displayOptions
  public mode: QbfGridMode
  public lineSorting: boolean
  //
  public lineSelector: boolean
  public lineSelectorCheckbox: (typeof QbfBooleanDisplayCheckbox) | null = null
  //
  public lineNumber: boolean
  public appendRow: boolean
  // Various
  public separatorWidth: number
  public nbLeftCols: number
  public nbRightCols: number
  public calculatedColWidths: boolean
  // Display
  public displayProperties: Map<string, string> = new Map<string, string>()
  //
  public onSelectionChange: ((ev: Event) => void) | null = null

  // -------------------------------------------------------------
  public constructor(qbForm: typeof QbForm,
                     parent: (typeof QbfElement) | null,
                     name: string,
                     inTable: boolean,
                     schema: IQbfSchema) {
  // -------------------------------------------------------------
    super(qbForm, parent, name, inTable, schema)
    // Update static variable
    QbfGridAbstract.gridList[QbfGridAbstract.lastIndex] = this
    QbfGridAbstract.lastIndex++

    // declare public data
    // -- grid data
    this.parent            = parent
    this.index             = QbfGridAbstract.lastIndex - 1
    this.columnMap         = new Map<string, QbfGridColumn>()
    this.columnList        = []
    this.data              = new QbfGridData(this)
    this.highlightedCol    = -1
    this.highlightedRow    = -1
    this.isTable           = true
    // DOM & style
    // this.style             = this.buildGridStyle()
    // -- header resizing
    this.maxWidth          = -1
    // -- sorting
    this.sortable          = true
    this.sortedCol         = -1
    // filter
    this.filter            = false
    // deletion
    this.deletion          = true
    // -- row selection
    this.hasMultiSelection = true
    this.lastSelectedLine  = -1
    this.onSelectionChange = null

    // Must be initialized by "init"
    this.appendQbfRow = null
    //
    this.storageModeRequired = "auto"
    this.storageMode = "object"
    // Display options
    this.mode = QbfGridMode.READ_WRITE
    this.lineSorting = true
    this.lineSelector = true
    this.lineNumber = true
    this.appendRow = true

    // Read parameters
    // class
    if (schema.class) {
      this.class = schema.class
    }
    const mode = schema[QbForm.nonStandardPrefix + "mode"]
    if (mode) {
      if (mode.toUpperCase() === "READ-ONLY") {
        this.mode = QbfGridMode.READ_ONLY
        this.lineSorting = false
        this.lineSelector = false
        this.editable = false
        this.appendRow = false
        this.deletion = false
      }
    }

    const lineSorting = schema[QbForm.nonStandardPrefix + "lineSorting"]
    if (QbForm.isDefined(lineSorting)) {
      this.lineSorting = QbForm.convertToBoolean(lineSorting)
    }
    const lineSelector = schema[QbForm.nonStandardPrefix + "lineSelector"]
    if (QbForm.isDefined(lineSelector)) {
      this.lineSelector = QbForm.convertToBoolean(lineSelector)
    }
    if (this.lineSelector) {
      const checkboxPath = "_qbfthl" + this.index + "_selectAll"
      const nbStates = 2
      const value = QbfBooleanValue.UNKNOWN
      const catchFocus = false
      const manageCallbacks = false
      const onChangeObjClass = "QbfGridAbstract"
      const onChangeFunction = "onClickSelectAllRows"
      this.lineSelectorCheckbox = new QbfBooleanDisplayCheckbox(this, checkboxPath, nbStates, value,
                                                                catchFocus, manageCallbacks, onChangeObjClass,
                                                                onChangeFunction)
    }
    // line number
    const lineNumber = schema[QbForm.nonStandardPrefix + "lineNumber"]
    if (QbForm.isDefined(lineNumber)) {
      this.lineNumber = QbForm.convertToBoolean(lineNumber)
    }
    // append row
    const appendRow = schema[QbForm.nonStandardPrefix + "append"]
    if (QbForm.isDefined(appendRow)) {
      this.appendRow = QbForm.convertToBoolean(appendRow)
    }
    // editable
    const editable = schema[QbForm.nonStandardPrefix + "editable"]
    if (QbForm.isDefined(editable)) {
      this.editable = QbForm.convertToBoolean(editable)
    }
    // sortable
    const sortable = schema[QbForm.nonStandardPrefix + "sortable"]
    if (QbForm.isDefined(sortable)) {
      this.sortable = QbForm.convertToBoolean(sortable)
    }
    // filter
    const filter = schema[QbForm.nonStandardPrefix + "filter"]
    if (QbForm.isDefined(filter)) {
      this.filter = QbForm.convertToBoolean(filter)
    }
    // deletion
    const deletion = schema[QbForm.nonStandardPrefix + "deletion"]
    if (QbForm.isDefined(deletion)) {
      this.filter = QbForm.convertToBoolean(deletion)
    }
    // this.setLocalPropertyFromSchema("storage-mode", schema)
    QbfFramedElement.setFramedElementProperties(this, schema, false)

    // separator Width
    this.separatorWidth = 1
    let separatorWidthCssProperty: string = QbForm.getCssStyleProperty("_qbfth-" + this.theme + "_separator", "width")
    if ( separatorWidthCssProperty ) {
      separatorWidthCssProperty = separatorWidthCssProperty.toLowerCase().replace("px", "")
      this.separatorWidth = parseInt(separatorWidthCssProperty, 10)
    }
    // -- Various --
    // nbLeftCols
    this.nbLeftCols = 0
    if (this.lineSorting) { this.nbLeftCols++ }
    if (this.lineSelector) { this.nbLeftCols++ }
    if (this.lineNumber) { this.nbLeftCols++ }
    // nbRightCols
    this.nbRightCols = 1
    this.calculatedColWidths = false

    // display
    QbfPropertyTools.addDisplayProperties(schema, QbForm.nonStandardPrefix, this.displayProperties)

  }

  // This function must be called at the end of CTORs
  // -------------------------------------------------------------
  public init() {
  // -------------------------------------------------------------
    if (this.appendRow) {
      // appendQbfRow (must be set after all is declared)
      this.appendQbfRow = new QbfGridAppendRow(this.qbForm, this, "QbfGrid_append_" + this.index,
                                               "UNKNOWN", false, null )
      this.appendQbfRow.isAppendRow = true
    }
    // TODO: Update display
    // QbfGridColumn.calculateAllColumnWidths( this )
    // QbfGridColumn.updateAllCssRules( this )
    // QbfGridHeader.updateAllCssRules( this )
  }

  // -------------------------------------------------------------
  public setProperty(property: string, value: any): void {
  // -------------------------------------------------------------
    if (property === "value") {
      this.setValue(value)
    } else {
      let updateDisplay = false
      const schema: IQbfSchema = {}
      schema[property] = value
      // set local property
      // updateDisplay = this.setLocalProperty(property, value, true) || updateDisplay
      // set other properties
      updateDisplay = QbfFramedElement.setFramedElementProperties(this, schema) || updateDisplay
      if (updateDisplay) {
        this.updateDisplay()
      }
    }
  }

  // -------------------------------------------------------------
  public setValue(value: any): void {
  // -------------------------------------------------------------
    const elementPath: string = QbForm.convertPathToString(this.elementPath)
    if (!Array.isArray(value)) {
      // tslint:disable-next-line: no-console
      console.log("Error - value set to " + elementPath + "is not a list ")
    } else {
      this.data.empty()
      let rowIndex = 0
      const newRowList: QbfGridRow[] = []
      value.forEach( (rowValue: any) => {
        if (Array.isArray(rowValue)) {
          newRowList.push( QbfGridRow.addFromArray(this, rowValue) )
          if ( this.storageModeRequired === "auto" ) {
            this.storageMode = "list"
          }
        } else {
          if (typeof rowValue === "object") {
            newRowList.push( QbfGridRow.addFromObject(this, rowValue) )
            if (this.storageModeRequired === "auto") {
              this.storageMode = "object"
            }
          } else {
            // tslint:disable-next-line: no-console
            console.log("Error - value #" + rowIndex + " set to " + elementPath
                        + "has unsupported type (", typeof rowValue , ")")
          }
        }
        rowIndex++
      })
      //
      let leftHtml = ""
      let centerHtml = ""
      let rightHtml = ""
      let iconHtml = ""
      for (const newRow of newRowList) {
        leftHtml += newRow.buildLeftHtml()
        centerHtml += newRow.buildCenterHtml()
        rightHtml += newRow.buildRightHtml()
        iconHtml += newRow.buildIconHtml()
      }
      // If grid is displayed, update Tables (left / center / right)
      const leftDomObject = QbForm.getElementById( "_qbftdl" + this.index)
      const centerDomObject = QbForm.getElementById( "_qbftdc" + this.index)
      const rightDomObject = QbForm.getElementById( "_qbftdr" + this.index)
      const iconDomObject = QbForm.getElementById( "_qbftdi" + this.index)
      if (leftDomObject) {
        leftDomObject.innerHTML += leftHtml
      }
      if (centerDomObject) {
        centerDomObject.innerHTML += centerHtml
      }
      if (rightDomObject) {
        rightDomObject.innerHTML += rightHtml
      }
      if (iconDomObject) {
        iconDomObject.innerHTML += iconHtml
      }
      if (leftDomObject || centerDomObject || rightDomObject ) {
        this.updateLayout()
      }
    }
  }

  // ------------------------------------------------------------------------------
  public getProperty(property: string): any {
  // ------------------------------------------------------------------------------
    let result: any = null
    if ( property === "value") {
      result = []
      this.data.rowList.forEach( (row: QbfGridRow) => {
        result.push(row.getProperty("value"))
      })
    }
    return result
  }

  // -------------------------------------------------------------
  public buildCanvasHtml(): string {
  // -------------------------------------------------------------
    const elementPath: string = QbForm.convertPathToString(this.elementPath)
    let html = ""

    const tableClass = "_qbft-" + this.theme
    const classAndStyle = this.buildHtmlClassAndStyle(QbForm.nonStandardPrefix,
      this.displayProperties, tableClass)

    // - - - - - - - - - - - - - - - - - - - - - -
    // QbfGrid
    // - - - - - - - - - - - - - - - - - - - - - -
    html += "<div id=\"_qbft" + this.index + "\" " + classAndStyle + ">"
    const hiddenStyle = " style=\"visibility: hidden;\""

    html += "<div id=\"_qbft" + this.index + "_mainTable\""
    html += " class=\"_qbft-" + this.theme + "_mainTable\""
    html += ">"
    // Header left
    html += "<div id=\"_qbfthl" + this.index + "_mainSubTable\""
    html += " class=\"_qbfthl-" + this.theme + "_mainSubTable\""
    html += ">"
    html += QbfGridHeader.buildLeftDivHtml(this)
    html += "</div>"
    // Header center
    html += "<div id=\"_qbfthc" + this.index + "_mainSubTable\""
    html += " class=\"_qbfthc-" + this.theme + "_mainSubTable\""
    html += ">"
    html += QbfGridHeader.buildCenterDivHtml(this)
    html += "</div>"
    // Data left
    html += "<div id=\"_qbftdl" + this.index + "_mainSubTable\""
    html += " class=\"_qbftdl-" + this.theme + "_mainSubTable\""
    html += ">"
    html += this.data.buildLeftDivHtml()
    html += "</div>"
    // Data center
    html += "<div id=\"_qbftdc" + this.index + "_mainSubTable\""
    html += " class=\"_qbftdc-" + this.theme + "_mainSubTable\""
    html += ">"
    html += this.data.buildCenterDivHtml()
    html += "</div>"
    // Data right
    html += "<div id=\"_qbftdr" + this.index + "_mainSubTable\""
    html += " class=\"_qbftdr-" + this.theme + "_mainSubTable\""
    html += ">"
    html += this.data.buildRightDivHtml()
    html += "</div>"
    // Data icon
    html += "<div id=\"_qbftdi" + this.index + "_mainSubTable\""
    html += " class=\"_qbftdi-" + this.theme + "_mainSubTable\""
    html += ">"
    html += this.data.buildIconDivHtml()
    html += "</div>"
    if ( this.appendQbfRow ) {
      // Append left
      html += "<div id=\"_qbftal" + this.index + "_mainSubTable\""
      html += " class=\"_qbftal-" + this.theme + "_mainSubTable\""
      html += ">"
      html += this.appendQbfRow.buildLeftDivHtml()
      html += "</div>"
      // Append center
      html += "<div id=\"_qbftac" + this.index + "_mainSubTable\""
      html += " class=\"_qbftac-" + this.theme + "_mainSubTable\""
      html += ">"
      html += this.appendQbfRow.buildCenterDivHtml()
      html += "</div>"
      // Append right
      html += "<div id=\"_qbftar" + this.index + "_mainSubTable\""
      html += " class=\"_qbftar-" + this.theme + "_mainSubTable\""
      html += ">"
      html += this.appendQbfRow.buildRightDivHtml()
      html += "</div>"
      // Append icon
      html += "<div id=\"_qbftai" + this.index + "_mainSubTable\""
      html += " class=\"_qbftai-" + this.theme + "_mainSubTable\""
      html += ">"
      html += this.appendQbfRow.buildIconDivHtml()
      html += "</div>"
    }

    html += "</div>" // End of main table

    // - - - - - - - - - - - - -
    // Mask (used when the grid is processed -> "wait" mode)
    // - - - - - - - - - - - - -
    html += "<div id=\"_qbft_mask_" + this.index + "\""
    html += " style=\""
    html += "  position: absolute;"
    html += "  left: 0px;"
    html += "  top: 0px;"
    html += "  width: 100%;"
    html += "  height: 100%;"
    html += "  background-color: grey;"
    html += "  opacity: 0.3;"
    html += "  cursor: wait;"
    html += "  visibility: hidden"
    html += "\" ></div>"
    // - - - - - - - - - - - - -
    // MAGIC DIV (hidden tricks)
    // - - - - - - - - - - - - -
    html += "<div id=\"_qbft_magic_" + this.index + "\""
    html += " style=\"width: 0px; height: 0px; overflow: hidden;\""
    html += ">"
    // Add invisible image to launch "_onLoad"
    html += "<img src=\"data:image/png;base64, Qk1CAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABAAEAAAAAAAQAAADEDgAAxA4AAAIAAAACAAAA////AAAAAAAH12/1\""
    html += "  onload=\"QbForm.getClass('QbfGridAbstract').onLoad(" + this.index + ")\""
    html += "/>"

    this.columnList.forEach( (column: QbfGridColumn) => {
      html += column.header.headerSeparator.getResizerDivHtml()
      html += column.header.filterSeparator.getResizerDivHtml()
    })

    html += "</div>" // _qbft_magic

    // -- QbfGrid
    html += "</div>"

    return html
  }

  // --------------------------------------------------------------
  public setOnSelectionChange( jsFunction: (ev: Event) => void ) {
  // --------------------------------------------------------------
    this.onSelectionChange = jsFunction
  }

  // --------------------------------------------------------------
  public addRow(rowValue: object[]): void {
  // --------------------------------------------------------------
    QbfGridRow.add( this , rowValue )
  }

  // --------------------------------------------------------------
  public updateLayout(): void {
  // --------------------------------------------------------------
    QbfGridColumn.updateAllColumnWidthValues(this)
    QbfGridHeader.updateAllHeaderWidths(this, null)
    this.data.resizeAllColumnWidths()
    if ( this.appendQbfRow ) {
      this.appendQbfRow.resizeAllColumnWidths()
    }
    this.data.resizeAllHeights()
    this.updateMainTableLayout()
  }

  // --------------------------------------------------------------
  public updateMainTableLayout(): void {
  // --------------------------------------------------------------
    const headerLeftDiv   = QbForm.getElementById( "_qbfthl" + this.index + "_mainSubTable" )
    const headerCenterDiv = QbForm.getElementById( "_qbfthc" + this.index + "_mainSubTable" )
    const dataLeftDiv     = QbForm.getElementById( "_qbftdl" + this.index + "_mainSubTable" )
    const dataCenterDiv   = QbForm.getElementById( "_qbftdc" + this.index + "_mainSubTable" )
    const dataRightDiv    = QbForm.getElementById( "_qbftdr" + this.index + "_mainSubTable" )
    const dataIconDiv     = QbForm.getElementById( "_qbftdi" + this.index + "_mainSubTable" )
    const appendCenterDiv = QbForm.getElementById( "_qbftac" + this.index + "_mainSubTable" )
    const appendRightDiv  = QbForm.getElementById( "_qbftar" + this.index + "_mainSubTable" )
    const appendIconDiv   = QbForm.getElementById( "_qbftai" + this.index + "_mainSubTable" )
    // Width
    const headerLeftWidth = ( headerLeftDiv ) ? headerLeftDiv.offsetWidth : 0
    const headerCenterWidth = ( headerCenterDiv ) ? headerCenterDiv.offsetWidth : 0
    const dataLeftWidth = ( dataLeftDiv ) ? dataLeftDiv.offsetWidth : 0
    const dataCenterWidth = ( dataCenterDiv ) ? dataCenterDiv.offsetWidth : 0
    const dataRightWidth = ( dataRightDiv ) ? dataRightDiv.offsetWidth : 0
    const dataIconWidth = ( dataIconDiv ) ? dataIconDiv.offsetWidth : 0
    const appendCenterWidth = ( appendCenterDiv ) ? appendCenterDiv.offsetWidth : 0
    const appendRightWidth = ( appendRightDiv ) ? appendRightDiv.offsetWidth : 0
    const appendIconWidth = ( appendIconDiv ) ? appendIconDiv.offsetWidth : 0
    let leftWidth = headerLeftWidth
    if ( dataLeftWidth > headerLeftWidth ) { leftWidth = dataLeftWidth }
    let centerWidth = headerCenterWidth
    if ( dataCenterWidth > centerWidth ) { centerWidth = dataCenterWidth }
    if ( appendCenterWidth > centerWidth ) { centerWidth = appendCenterWidth }
    let rightWidth = dataRightWidth
    if ( appendRightWidth > rightWidth ) { rightWidth = appendRightWidth }
    let iconWidth = dataIconWidth
    if ( appendIconWidth > iconWidth ) { iconWidth = appendIconWidth }
    // Height
    const headerLeftHeight = ( headerLeftDiv ) ? headerLeftDiv.offsetHeight : 0
    const headerCenterHeight = ( headerCenterDiv ) ? headerCenterDiv.offsetHeight : 0
    const dataLeftHeight = ( dataLeftDiv ) ? dataLeftDiv.offsetHeight : 0
    const dataCenterHeight = ( dataCenterDiv ) ? dataCenterDiv.offsetHeight : 0
    const dataRightHeight = ( dataRightDiv ) ? dataRightDiv.offsetHeight : 0
    const dataIconHeight = ( dataIconDiv ) ? dataIconDiv.offsetHeight : 0
    const appendCenterHeight = ( appendCenterDiv ) ? appendCenterDiv.offsetHeight : 0
    const appendRightHeight = ( appendRightDiv ) ? appendRightDiv.offsetHeight : 0
    const appendIconHeight = ( appendIconDiv ) ? appendIconDiv.offsetHeight : 0
    let headerHeight = headerLeftHeight
    if ( headerCenterHeight > headerHeight ) { headerHeight = headerCenterHeight }
    let dataHeight = dataLeftHeight
    if ( dataCenterHeight > dataHeight ) { dataHeight = dataCenterHeight }
    if ( dataRightHeight > dataHeight ) { dataHeight = dataRightHeight }
    if ( dataIconHeight > dataHeight ) { dataHeight = dataIconHeight }
    let appendHeight = appendCenterHeight
    if ( appendRightHeight > appendHeight ) { appendHeight = appendRightHeight }
    if ( appendIconHeight > appendHeight ) { appendHeight = appendIconHeight }
    //
    QbfGridAbstract.setDivLeftAndTop(headerLeftDiv, 0, 0)
    QbfGridAbstract.setDivLeftAndTop(headerCenterDiv, leftWidth, 0)
    QbfGridAbstract.setDivLeftAndTop(dataLeftDiv, 0, headerHeight)
    QbfGridAbstract.setDivLeftAndTop(dataCenterDiv, leftWidth, headerHeight)
    QbfGridAbstract.setDivLeftAndTop(dataRightDiv, leftWidth + centerWidth, headerHeight)
    QbfGridAbstract.setDivLeftAndTop(dataIconDiv, leftWidth + centerWidth + rightWidth, headerHeight)
    QbfGridAbstract.setDivLeftAndTop(appendCenterDiv, leftWidth, headerHeight + dataHeight)
    QbfGridAbstract.setDivLeftAndTop(appendRightDiv, leftWidth + centerWidth + rightWidth, headerHeight + dataHeight)
    QbfGridAbstract.setDivLeftAndTop(appendIconDiv, leftWidth + centerWidth + rightWidth, headerHeight + dataHeight)
    // Update main Div width and height
    const mainDiv = QbForm.getElementById( "_qbft" + this.index + "_mainTable" )
    const mainDivWidth = leftWidth + centerWidth + rightWidth + iconWidth
    const mainDivHeight = headerHeight + dataHeight + appendHeight + 3
    if ( mainDiv ) {
      mainDiv.style.width = mainDivWidth + "px"
      mainDiv.style.height = mainDivHeight + "px"
    }
  }

}
