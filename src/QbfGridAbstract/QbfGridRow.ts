import QbfBooleanDisplayCheckbox from "../QbfModule/QbfBooleanDisplayCheckbox"
import QbfElement from "../QbfModule/QbfElement"
import QbfElementFactory from "../QbfModule/QbfElementFactory"
import QbForm from "../QbfModule/QbForm"

import QbfGridAbstract from "./QbfGridAbstract"
import QbfGridAppendRow from "./QbfGridAppendRow"
import QbfGridColumn from "./QbfGridColumn"

import { QbfBooleanValue } from "../QbfModule/QbfBoolean"

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

// ===========================================================
export interface IRowSchema {
// ===========================================================
  [index: string]: any
}
// French joke: IRowSchema c'est de la bombe !

// ===========================================================
export enum QbfGridRowHighlightMode {
// ===========================================================
  NO_HIGHLIGHT,
  STANDARD,
  DELETE,
}

// ===========================================================
export enum QbfGridRowHighlightedGrid {
// ===========================================================
  UNKNOWN,
  LEFT,
  CENTER,
  RIGHT,
  ICON,
}

// ===============================================================
export default class QbfGridRow extends QbfElement {
// ===============================================================
  // **************************************
  // QbfGridRow: static
  // **************************************

  // This function is called when the mouse enter/leave the row
  // -------------------------------------------------------------
  public static highlight(highlightMode: QbfGridRowHighlightMode,
                          grid: QbfGridAbstract,
                          highlightedGrid: QbfGridRowHighlightedGrid,
                          colId: number,
                          rowId: number): void {
  // -------------------------------------------------------------
    // Update Left grid
    for (let i = 0; i < 3 ; i++ ) {
      const divId = "_qbftdl" + grid.index + "_" + i + "_" + rowId
      const div = QbForm.getElementById(divId)
      if (div) {
        const highlightModeEx = ( i === colId && highlightedGrid === QbfGridRowHighlightedGrid.LEFT )
                                ? QbfGridRowHighlightMode.NO_HIGHLIGHT : highlightMode
        const standardHighlightClassName = "_qbftdl-" + grid.theme + "_highlight_standard"
        const deleteHighlightClassName   = "_qbftdl-" + grid.theme + "_highlight_delete"
        switch (highlightModeEx) {
          case QbfGridRowHighlightMode.NO_HIGHLIGHT:
            div.classList.remove( standardHighlightClassName )
            div.classList.remove( deleteHighlightClassName )
            break
          case QbfGridRowHighlightMode.STANDARD:
            div.classList.add( standardHighlightClassName )
            div.classList.remove( deleteHighlightClassName )
            break
          case QbfGridRowHighlightMode.DELETE:
            div.classList.remove( standardHighlightClassName )
            div.classList.add( deleteHighlightClassName )
            break
        }
      }
    }
    // Update center grid
    for (let i = 0; i < grid.columnList.length ; i++ ) {
      const divId = "_qbftdc" + grid.index + "_" + i + "_" + rowId
      const div = QbForm.getElementById(divId)
      if (div) {
        const highlightModeEx = ( i === colId && highlightedGrid === QbfGridRowHighlightedGrid.CENTER )
                                ? QbfGridRowHighlightMode.NO_HIGHLIGHT : highlightMode
        let standardHighlightClassName = "_qbftdc-" + grid.theme + "_highlight_standard"
        let deleteHighlightClassName   = "_qbftdc-" + grid.theme + "_highlight_delete"
        switch (highlightModeEx) {
          case QbfGridRowHighlightMode.NO_HIGHLIGHT:
            div.classList.remove( standardHighlightClassName)
            div.classList.remove( deleteHighlightClassName)
            break
          case QbfGridRowHighlightMode.STANDARD:
            div.classList.add( standardHighlightClassName)
            div.classList.remove( deleteHighlightClassName)
            break
          case QbfGridRowHighlightMode.DELETE:
            div.classList.remove( standardHighlightClassName)
            div.classList.add( deleteHighlightClassName)
            break
        }
        const htmlDiv = div.firstChild?.firstChild as HTMLElement
        if (htmlDiv && htmlDiv.id && htmlDiv.id.endsWith("_INPUT") ) {
          standardHighlightClassName = "_qbftdc-" + grid.theme + "_input_highlight_standard"
          deleteHighlightClassName = "_qbftdc-" + grid.theme + "_input_highlight_delete"
          switch (highlightModeEx) {
            case QbfGridRowHighlightMode.NO_HIGHLIGHT:
              htmlDiv.classList.remove( standardHighlightClassName)
              htmlDiv.classList.remove( deleteHighlightClassName)
              break
            case QbfGridRowHighlightMode.STANDARD:
              htmlDiv.classList.add( standardHighlightClassName)
              htmlDiv.classList.remove( deleteHighlightClassName)
              break
            case QbfGridRowHighlightMode.DELETE:
              htmlDiv.classList.remove( standardHighlightClassName)
              htmlDiv.classList.add( deleteHighlightClassName)
              break
          }
        }
      }
    }
  }

  // --------------------------------------------------------------
  public static onSelectRow(parentPath: string,
                            oldValue: QbfBooleanValue,
                            newValue: QbfBooleanValue): void {
  // --------------------------------------------------------------
    const row = QbForm.getElementFromElementPath(parentPath)[0] as QbfGridRow
  }

  // --------------------------------------------------------------
  public static addFromArray(grid: QbfGridAbstract, cellValues: any[]): QbfGridRow {
  // --------------------------------------------------------------
    const rowIndex = grid.data.rowList.length + 1
    const newRow = new QbfGridRow(grid.qbForm, grid, "" + rowIndex, "UNKNOWN", false, cellValues)
    // newRow.displayIndex = rowIndex
    grid.data.rowList.push(newRow)
    return newRow
  }

  // --------------------------------------------------------------
  public static addFromObject(grid: QbfGridAbstract, cellValues: object): QbfGridRow {
  // --------------------------------------------------------------
    const cellValuesEx = cellValues as IRowSchema
    const cellValuesAsArray: any[] = []
    // const colIndex = 0
    grid.columnMap.forEach( (column: QbfGridColumn) => {
      let cellValue = cellValuesEx[column.definition.name]
      if (cellValue === undefined ) { cellValue = null }
      cellValuesAsArray.push(cellValue)
    })
    return QbfGridRow.addFromArray(grid, cellValuesAsArray)
  }

  // --------------------------------------------------------------
  public static onClickDeleteIcon(gridIndex: number, event: MouseEvent): void {
  // --------------------------------------------------------------
    const grid: QbfGridAbstract = QbfGridAbstract.gridList[gridIndex]
    const cellPrefix = "_qbftdi"
    if (event.target ) {
      const element = event.target as HTMLElement
      let elementId = element.id
      if (elementId === "" && element.parentElement ) {
        elementId = element.parentElement.id
      }
      elementId = elementId.substring(cellPrefix.length)
      const fields: string[] = elementId.split("_")
      const rowId = parseInt(fields[2], 10)
      const rowData = grid.data.rowList[rowId - 1].getCellValuesAsObject()
      const propagate = grid.sendEvent( "rowDeletion", grid, { id: rowId, row: rowData } )
      if (propagate ) {
        grid.data.removeRow( rowId )
      }
    }
  }

  // --------------------------------------------------------------
  public static onClickAddRow(gridIndex: number, event: MouseEvent): void {
  // --------------------------------------------------------------
    const grid: QbfGridAbstract = QbfGridAbstract.gridList[gridIndex]

    const appendQbfRow = grid.appendQbfRow
    if (appendQbfRow ) {
      const cellValues: any[] = appendQbfRow.getCellValuesAsArray()
      const newRow = QbfGridRow.addFromArray( grid, cellValues)
      const propagate = grid.sendEvent("rowAppend", grid, { id: grid.data.rowList.length,
                                                           row: newRow.getCellValuesAsObject() } )
      if (propagate ) {
        const leftHtml = newRow.buildLeftHtml()
        const centerHtml = newRow.buildCenterHtml()
        const rightHtml = newRow.buildRightHtml()
        const iconHtml = newRow.buildIconHtml()
        // If grid is displayed, update Tables (left / data / right)
        const leftDomObject = QbForm.getElementById( "_qbftdl" + grid.index)
        const centerDomObject = QbForm.getElementById( "_qbftdc" + grid.index)
        const rightDomObject = QbForm.getElementById( "_qbftdr" + grid.index)
        const iconDomObject = QbForm.getElementById( "_qbftdi" + grid.index)
        if (leftDomObject ) {
          leftDomObject.innerHTML += leftHtml
        }
        if (centerDomObject ) {
          centerDomObject.innerHTML += centerHtml
        }
        if (rightDomObject ) {
          rightDomObject.innerHTML += rightHtml
        }
        if (iconDomObject ) {
          iconDomObject.innerHTML += iconHtml
        }
        QbfGridAppendRow.initWithDefaultValues(grid)
        grid.updateLayout()
      }
    }
    // "Unfocus" the Add Button
    const addButton = QbForm.getElementById("_qbfti_add_button_" + gridIndex )
    if (addButton) { addButton.blur() }
  }

  // **************************************
  // QbfGridRow: instance
  // **************************************

  public storageIndex: number
  public index: number
  public cellMap: Map<string, (typeof QbfElement)>
  public isAppendRow: boolean
  public isVisible: boolean
  public deletion: boolean // = true is row can be deleted
  public selectCheckbox: (typeof QbfBooleanDisplayCheckbox)

  // --------------------------------------------------------------
  public constructor(qbForm: (typeof QbForm),
                     parent: (typeof QbfElement) | null,
                     name: string,
                     type: string,
                     inTable: boolean,
                     cellValues: any[] | null ) {
  // --------------------------------------------------------------
    super(qbForm, parent, name, type, inTable, {})
    const grid = parent as QbfGridAbstract
    this.storageIndex = (grid && grid.data.rowList ) ? grid.data.rowList.length : -1
    this.index = Number.parseInt(name, 10)
    // this.displayIndex = -1
    this.isAppendRow = false
    this.isVisible = true
    this.deletion = grid.deletion
    const checkboxValue = QbfBooleanValue.FALSE
    const nbStates = 2
    const checkboxPath = QbForm.convertPathToString( this.elementPath ) + "_select"
    const catchFocus = false
    const manageCallbacks = false
    const onChangeObjClass = "QbfGridRow"
    const onChangeFunction = "onSelectRow"
    this.selectCheckbox = new QbfBooleanDisplayCheckbox(this, checkboxPath, nbStates, checkboxValue, catchFocus,
                                                        manageCallbacks, onChangeObjClass, onChangeFunction)

    this.cellMap = new Map<string, (typeof QbfElement)>()
    let colIndex = 0
    grid.columnMap.forEach( (column: QbfGridColumn, columnName: string) => {
      const cell: (typeof QbfElement) | null = QbfElementFactory.createQbfElement(qbForm, this,
                                                      column.definition.name, true, column.definition.cellSchema)
      if (cell ) {
        cell.editable = column.definition.editable
        this.cellMap.set( columnName, cell)
        if (cellValues ) {
          if (colIndex < cellValues.length) {
            cell.setProperty("value", cellValues[colIndex])
          }
        }
        colIndex++
      }
    })
  }

  // ***************************************
  // Methods for QbfElement
  // ***************************************

  // -------------------------------------------------------------
  public setProperty(property: string, value: any): void {
  // -------------------------------------------------------------
    // tslint:disable: no-console
    console.log( "ERROR: ********************************************")
    console.log( "ERROR: QbfGridRow.setProperty not implemented yet")
    console.log( "ERROR: ********************************************")
    // tslint:enable: no-console
  }

  // ------------------------------------------------------------------------------
  public getProperty(property: string): any {
  // ------------------------------------------------------------------------------
    let result: any = null
    if (property === "value") {
      const grid = this.parent as QbfGridAbstract
      if (grid.storageMode === "object" ) {
        const objResult: {[key: string]: any} = {}
        // fieldList: Map<String,QbfElement>
        this.cellMap.forEach( (cell: (typeof QbfElement)) => {
          const elementValue = cell.getProperty("value")
          objResult[cell.name] = elementValue
        })
        result = objResult
      }
      if (grid.storageMode === "list" ) {
        const listResult: any[] = []
        this.cellMap.forEach( (cell: (typeof QbfElement)) => {
          const elementValue = cell.getProperty("value")
          listResult.push(elementValue)
        })
        result = listResult
      }
    }
    return result
  }

  // -------------------------------------------------------------
  public buildLeftHtml(): string {
  // -------------------------------------------------------------
    let html = ""
    const grid = this.parent as QbfGridAbstract
    if (grid.lineSorting || grid.lineSelector || grid.lineNumber ) {
      if (!this.isAppendRow ) {
        let divId = ""
        if (grid.lineSorting) {
          // row sorting
          divId = "_qbftdl" + grid.index + "_0_" + this.index
          html += "<div id=\"" + divId + "\""
          html += " class=\"_qbftdl-" + this.theme + "_rowSorting\""
          html += ">&nbsp;</div>"
        }
        if (grid.lineSelector) {
          // row selector
          divId = "_qbftdl" + grid.index + "_1_" + this.index
          html += "<div id=\"" + divId + "\""
          html += " class=\"_qbftdl-" + this.theme + "_select\""
          html += ">"
          html += this.selectCheckbox.buildHtmlDiv()
          html += "</div>"
        }
        if (grid.lineNumber ) {
          // line number
          divId = "_qbftdl" + grid.index + "_2_" + this.index
          html += "<div id=\"" + divId + "\""
          html += " class=\"_qbftdl-" + this.theme + "_lineNumber\""
          html += ">"
          html += "" + this.index
          html += "</div>"
        }
      } else {
        // appendQbfRow
        html += "&nbsp;"
      }
    }
    return html
  }

  // -------------------------------------------------------------
  public buildCenterHtml(): string {
  // -------------------------------------------------------------
    // const elementPath: string = QbForm.convertPathToString(this.elementPath)
    const grid = this.parent as QbfGridAbstract
    let colIndex = 0
    const indexSuffix = (this.isAppendRow) ? "append" : this.index
    let html = ""
    this.cellMap.forEach( (cell: (typeof QbfElement), columnName: string) => {
      const cellId = "_qbftdc" + grid.index + "_" + colIndex + "_" + indexSuffix
      // const cell_class = "_qbftdc" + grid.index + "_" + colIndex
      const col = grid.columnList[colIndex]
      let editable = col.definition.editable
      if (this.isAppendRow) { editable = true }
      // html += "<div id="" + cell_id + "" class="" + cell_class + "">"
      html += "<div id=\"" + cellId + "\">"
      // html += cell.buildHtml(true, editable)
      html += cell.buildHtml()
      html += "</div>"
      colIndex++
    })
    return html
  }

  // -------------------------------------------------------------
  public buildRightHtml(): string {
  // -------------------------------------------------------------
    const grid = this.parent as QbfGridAbstract
    const html = ""
    return html
  }

  // -------------------------------------------------------------
  public buildIconHtml(): string {
  // -------------------------------------------------------------
    const grid = this.parent as QbfGridAbstract
    let html = ""
    const cellId = "_qbftdi" + grid.index + "_0_" + this.index
    if (this.isAppendRow) {
      html += "<div class=\"_qbftdi-" + grid.theme + "_add\">"
      html += "<input id=\"_qbftdi_add_button_" + grid.index + "\" type=\"button\" value=\"+\""
      html += " onclick=\"QbForm.getClass('QbfGridRow').onClickAddRow(" + grid.index + ",event)\""
      html += ">"
      html += "</input>"
      html += "</div>"
    } else {
      if (this.deletion ) {
        html += "<div id=\"" + cellId + "\""
        html += " class=\"_qbftdi-" + grid.theme + "_delete\""
        html += " onClick=\"QbForm.getClass('QbfGridRow').onClickDeleteIcon(" + grid.index + ",event)\""
        html += "><div></div></div>"
      } else {
        html += "<div></div>"
      }
    }
    return html
  }

  // -------------------------------------------------------------
  public setVisibility(visibility: boolean): void {
  // -------------------------------------------------------------
    const grid = this.parent as QbfGridAbstract
    // update left grid
    const leftGrid = QbForm.getElementById( "_qbftdl" + grid.index )
    if (leftGrid && grid.nbLeftCols > 0 ) {
      const firstDivIndex = (this.index - 1) * grid.nbLeftCols
      for (let i = 0; i < grid.nbLeftCols; i++) {
        const divIndex = firstDivIndex + i
        const div = leftGrid.children[divIndex] as HTMLElement
        if (div ) {
          QbForm.setHtmlElementVisibility(div, visibility)
        }
      }
    }

    // update Data grid
    const dataGrid = QbForm.getElementById( "_qbftdc" + grid.index )
    const nbCols = grid.columnList.length
    if (dataGrid && nbCols > 0 ) {
      const firstDivIndex = (this.index - 1) * nbCols
      for (let i = 0; i < nbCols; i++) {
        const divIndex = firstDivIndex + i
        const div = dataGrid.children[divIndex] as HTMLElement
        if (div ) {
          QbForm.setHtmlElementVisibility(div, visibility)
        }
      }
    }
    // update icon grid
    const iconGrid = QbForm.getElementById( "_qbftdi" + grid.index )
    const nbIcons = 1
    if (iconGrid && nbIcons > 0 ) {
      const firstDivIndex = (this.index - 1) * nbIcons
      for (let i = 0; i < nbIcons; i++) {
        const divIndex = firstDivIndex + i
        const div = iconGrid.children[divIndex] as HTMLElement
        if (div ) {
          QbForm.setHtmlElementVisibility(div, visibility)
        }
      }
    }
  }

  // -------------------------------------------------------------
  public getCellValuesAsArray(): any[] {
  // -------------------------------------------------------------
    const result: any[] = []
    this.cellMap.forEach( (cell: (typeof QbfElement) ) => {
      result.push(cell.getProperty("value"))
    })
    return result
  }

  // -------------------------------------------------------------
  public getCellValuesAsObject(): object {
  // -------------------------------------------------------------
    const result: IRowSchema = {}
    this.cellMap.forEach( (cell: (typeof QbfElement) ) => {
      result[cell.label] = cell.getProperty("value")
    })
    return result
  }

  // -------------------------------------------------------------
  public select( newStatus: QbfBooleanValue) {
  // -------------------------------------------------------------
    this.selectCheckbox.setValue( newStatus )
  }

  // -------------------------------------------------------------
  public setLeftHeight( height: number): void {
  // -------------------------------------------------------------
    const grid = this.parent as QbfGridAbstract
    const leftGrid = QbForm.getElementById( "_qbftdl" + grid.index )
    if (leftGrid && grid.nbLeftCols > 0 ) {
      const firstDivIndex = (this.index - 1) * grid.nbLeftCols
      for (let i = 0; i < grid.nbLeftCols; i++) {
        const divIndex = firstDivIndex + i
        const div = leftGrid.children[divIndex] as HTMLElement
        if (div ) {
          div.style.height = "" + height + "px"
        }
      }
    }
  }

  // -------------------------------------------------------------
  public setRightHeight( height: number): void {
  // -------------------------------------------------------------
  }

  // -------------------------------------------------------------
  public setIconHeight( height: number): void {
  // -------------------------------------------------------------
    const grid = this.parent as QbfGridAbstract
    const rightGrid = QbForm.getElementById( "_qbftdi" + grid.index )
    if (rightGrid && grid.nbRightCols > 0 ) {
      const firstDivIndex = (this.index - 1) * grid.nbRightCols
      for (let i = 0; i < grid.nbRightCols; i++) {
        const divIndex = firstDivIndex + i
        const div = rightGrid.children[divIndex] as HTMLElement
        if (div ) {
          div.style.height = "" + height + "px"
        }
      }
    }
  }
}
