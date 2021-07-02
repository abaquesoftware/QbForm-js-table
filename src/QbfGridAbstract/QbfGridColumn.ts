import QbfElement, { IQbfSchema } from "../QbfModule/QbfElement"
import QbForm from "../QbfModule/QbForm"
import { QbfUnit, QbfUnitTools } from "../QbfModule/QbfUnit"

import QbfGridAbstract, { QbfGridMode } from "./QbfGridAbstract"
import QbfGridHeader from "./QbfGridHeader"

// ===========================================================
interface IQbfGridColumnDefinition {
// ===========================================================
  [index: string]: any
}

// ===============================================================
export class QbfGridColumnDefinition {
// ===============================================================
  public grid: QbfGridAbstract
  public name: string
  public type: string
  public label: string
  public columnWidth: string
  // widthUnit: typeof QbfUnit
  public schema: object // original Schema
  public cellSchema: IQbfSchema // schema applied to cells (remove width, etc...)
  public valid: boolean
  public editable: boolean
  public sortable: boolean
  public filter: boolean

  // ---------------------------------------------------------------
  public constructor(grid: QbfGridAbstract, name: string, definition: object) {
  // ---------------------------------------------------------------
    this.grid = grid
    this.name = name
    this.type = "UNKNOWN"
    this.label = ""
    this.schema = definition
    this.columnWidth = "auto"
    // this.widthUnit = QbfUnit.BLOCK
    this.valid = true
    this.editable = grid.editable
    this.sortable = grid.sortable
    this.filter = grid.filter

    const def = definition as IQbfGridColumnDefinition

    // build cell schema
    this.cellSchema = {}
    Object.keys(def).forEach( (key: string) => {
      if ( key !== QbForm.nonStandardPrefix + "columnWidth") {
        this.cellSchema[key] = def[key]
      }
    })
    // type
    if (definition.hasOwnProperty(QbForm.nonStandardPrefix + "type")) {
      this.type = def[QbForm.nonStandardPrefix + "type"].toString()
    }
    // label
    if (definition.hasOwnProperty(QbForm.nonStandardPrefix + "label")) {
      this.label = def[QbForm.nonStandardPrefix + "label"].toString()
    } else {
      this.label = this.name
    }
    // editable
    if (definition.hasOwnProperty(QbForm.nonStandardPrefix + "editable")) {
      this.editable = QbForm.convertToBoolean( def[QbForm.nonStandardPrefix + "editable"])
    }
    // sortable
    if (definition.hasOwnProperty(QbForm.nonStandardPrefix + "sortable")) {
      this.sortable = QbForm.convertToBoolean( def[QbForm.nonStandardPrefix + "sortable"])
    }
    // filter
    if (definition.hasOwnProperty(QbForm.nonStandardPrefix + "filter")) {
      this.filter = QbForm.convertToBoolean( def[QbForm.nonStandardPrefix + "filter"])
    }
    // columnWidth
    if (definition.hasOwnProperty(QbForm.nonStandardPrefix + "columnWidth")) {
      this.columnWidth = def[QbForm.nonStandardPrefix + "columnWidth"].toString().toLowerCase().replace("%", "fr")
    }
    if (this.name === "") { this.valid = false }
    if (this.type === "UNKNOWN") { this.valid = false }
  }
}

// Note: QbfGridColumn extends QbfElement, so that QbfGridFilters can refers to their columns
// ===============================================================
// tslint:disable-next-line: max-classes-per-file
export default class QbfGridColumn extends QbfElement {
// ===============================================================
  // **************************************
  // QbfGridColumn: static
  // **************************************
  // ---------------------------------------------------------------
  public static initializeAllColumnWidthValues(grid: QbfGridAbstract): void {
  // --------------------------------------------------------------
    const gridId = grid.index
    const mainTableDiv = QbForm.getElementById("_qbft" + gridId + "_mainTable" )
    const leftSubTableDiv = QbForm.getElementById("_qbftdl" + gridId + "_mainSubTable" )
    const rightSubTableDiv = QbForm.getElementById("_qbftdr" + gridId + "_mainSubTable" )
    const iconSubTableDiv = QbForm.getElementById("_qbftdi" + gridId + "_mainSubTable" )
    const iconAppendSubTableDiv = QbForm.getElementById("_qbftai" + gridId + "_mainSubTable" )
    // Width
    const mainTableWidth = mainTableDiv ? mainTableDiv.offsetWidth : 1000
    const leftSubTableWidth = leftSubTableDiv ? leftSubTableDiv.offsetWidth : 0
    const rightSubTableWidth = rightSubTableDiv ? rightSubTableDiv.offsetWidth : 0
    let iconSubTableWidth = iconSubTableDiv ? iconSubTableDiv.offsetWidth : 0
    const iconAppendSubTableWidth = iconAppendSubTableDiv ? iconAppendSubTableDiv.offsetWidth : 0
    if (iconAppendSubTableWidth > iconSubTableWidth) { iconSubTableWidth = iconAppendSubTableWidth }
    let centerSubTableWidth = mainTableWidth - leftSubTableWidth - rightSubTableWidth - iconSubTableWidth
    centerSubTableWidth -= grid.columnList.length * grid.separatorWidth
    if (centerSubTableWidth < 0) { centerSubTableWidth = 0 }
    let freeSpace = centerSubTableWidth
    // Calculate width when column width is fixed (px)
    let index = 0
    for (const column of grid.columnList) {
      const colWidthValue = column.definition.columnWidth
      if (colWidthValue === "auto") {
        let cell =  QbForm.getElementById("_qbftdc" + grid.index )?.children[index] as HTMLDivElement
        if (!cell) {
          cell =  QbForm.getElementById("_qbftac" + grid.index )?.children[index] as HTMLDivElement
        }
        if (cell) {
          column.width = cell.offsetWidth
          if (column.width < 20) { column.width = 150 }
        } else {
          column.width = 150
        }
        freeSpace -= column.width
    } else {
        const value = QbfUnitTools.extractNumber(colWidthValue)
        const unit = QbfUnitTools.extractUnit(colWidthValue)
        if (unit === "px" ) {
          column.width = value
          freeSpace -= column.width
        }
      }
      index++
    }
    // Calculate total percentage
    let totalPercent = 0
    for (const column of grid.columnList) {
      const colWidthValue = column.definition.columnWidth
      const value = QbfUnitTools.extractNumber(colWidthValue)
      const unit = QbfUnitTools.extractUnit(colWidthValue)
      if (unit === "%" ) {
        totalPercent += value
      }
    }
    if (totalPercent <= 0) { totalPercent = 1 }
    // Calculate width when column width is %
    for (const column of grid.columnList) {
      const colWidthValue = column.definition.columnWidth
      const value = QbfUnitTools.extractNumber(colWidthValue)
      const unit = QbfUnitTools.extractUnit(colWidthValue)
      if (unit === "%") {
        column.width = freeSpace * (value / totalPercent)
      }
    }
    if (grid.appendQbfRow) {
      grid.appendQbfRow.resizeAllColumnWidths()
    }
  }

  // ---------------------------------------------------------------
  public static updateAllColumnWidthValues(grid: QbfGridAbstract): void {
  // --------------------------------------------------------------
    let gridElement: HTMLElement | null = null
    if (!grid.calculatedColWidths) {
      QbfGridColumn.initializeAllColumnWidthValues(grid)
      grid.calculatedColWidths = true
    } else {
      if ( grid.columnList.length > 0 && grid.data.rowList.length > 0 ) {
        gridElement =  QbForm.getElementById("_qbftdc" + grid.index )
      }
      if ( !gridElement && grid.appendRow ) {
        gridElement =  QbForm.getElementById("_qbftac" + grid.index )
      }
      if ( !gridElement ) {
        gridElement =  QbForm.getElementById("_qbfthc" + grid.index )
      }
      if ( gridElement ) {
        for (let i = 0 ; i < grid.columnList.length; i++) {
          const columnDiv = gridElement?.children[i] as HTMLDivElement
          const columnWidthValue = columnDiv.offsetWidth
          grid.columnList[i].width = columnWidthValue
        }
      }
    }
  }

  // **************************************
  // QbfGridColumn: instance
  // **************************************
  // Definition
  public grid: QbfGridAbstract
  public index: number
  public name: string
  public definition: QbfGridColumnDefinition
  public header: QbfGridHeader
  // Calculated
  public width: number

  // ---------------------------------------------------------------
  public constructor(grid: QbfGridAbstract, index: number, name: string, definition: object) {
  // ---------------------------------------------------------------
    const qbForm = grid.qbForm
    const inTable = true
    const schema = {} // useless
    super(qbForm, grid, name, inTable, schema)
    // Declare public data
    this.grid = grid
    this.index = index
    this.name = name
    this.definition = new QbfGridColumnDefinition( grid, name, definition )
    // this.definition.editable depends on grid.mode
    this.definition.editable = (grid.mode === QbfGridMode.READ_WRITE )
    // Calculated values
    this.width  = -1
    this.header = new QbfGridHeader(this)
  }

  // Required to extends QbfElement
  // tslint:disable:no-empty
  public setProperty( property: string, value: any): void {}
  public getProperty( property: string): any {}
  public buildHtml(): string { return "" }
  // tslint:enable:no-empty
}
