import QbfElement from "../QbfModule/QbfElement"
import QbForm from "../QbfModule/QbForm"

import QbfGridAbstract, {QbfGridColumnSortMode} from "./QbfGridAbstract"
import QbfGridColumn from "./QbfGridColumn"
import QbfGridFilter from "./QbfGridFilter"
import QbfGridHeaderSeparator from "./QbfGridHeaderSeparator"
import QbfGridRow from "./QbfGridRow"

// ===============================================================
class QbfGridTmpSortLine {
// ===============================================================
  public lineID: number
  public value: (typeof QbfElement)
  public sorted: boolean

  // ---------------------------------------------------------------
  constructor( lineID: number, value: (typeof QbfElement) ) {
  // ---------------------------------------------------------------
    this.lineID = lineID
    this.value = value
    this.sorted = false
  }
}

// ===============================================================
// tslint:disable-next-line: max-classes-per-file
export default class QbfGridHeader {
// ===============================================================
  // **************************************
  // QbfGridHeader: static
  // **************************************
  // ---------------------------------------------------------------
  public static buildLeftDivHtml(grid: QbfGridAbstract): string {
  // ---------------------------------------------------------------
    let html = ""
    let style = ""
    let filterExists = false
    grid.columnList.forEach( (column: QbfGridColumn) => {
      if ( column.definition.filter ) { filterExists = true }
    })
    if ( grid.lineSorting || grid.lineSelector || grid.lineNumber ) {
      style = "grid-template-columns:"
      if ( grid.lineSorting  ) { style += "20px " }
      if ( grid.lineSelector ) { style += "30px " }
      if ( grid.lineNumber   ) { style += "45px " }
      style += ";"
      html += "<div id=\"_qbfthl" + grid.index + "\""
      html += " class=\"_qbfthl-" + grid.theme + "\""
      html += " style=\"" + style + "\""
      html += ">" // qbfthl

      let className = ""
      if ( filterExists ) {
        className = "class=\"_qbftFilterCell-" + grid.theme + "\""

        if ( grid.lineSorting ) {
          html += "<div><div></div></div>"
        }
        if ( grid.lineSelector ) {
          html += "<div><div></div></div>"
        }
        if ( grid.lineNumber ) {
          html += "<div><div></div></div>"
        }
      }

      if ( grid.lineSorting ) {
        // row selector
        html += "<div " + className + "><div></div></div>"
      }
      if ( grid.lineSelector ) {
        html += "<div " + className + ">"
        html += grid.lineSelectorCheckbox.buildHtmlDiv()
        html += "</div>"
      }
      // line number
      if ( grid.lineNumber ) {
        html += "<div " + className + ">"
        html +=  "<div class=\"_qbfthl-" + grid.theme + "_text\">#</div>"
        html += "</div>"
      }
      html += "</div>" // qbfthl
    }
    return html
  }

  // ---------------------------------------------------------------
  public static buildCenterDivHtml(grid: QbfGridAbstract): string {
  // ---------------------------------------------------------------
    let html = ""
    let style = ""
    if ( grid.columnMap.size > 0 ) {
      style = "grid-template-columns:"
      grid.columnMap.forEach( (column: QbfGridColumn, colName: string) => {
        if (grid.calculatedColWidths) {
          style += column.width
          style += "px "
        } else {
          style += column.definition.columnWidth
          style += " "
        }
        style += grid.separatorWidth + "px "
      })
      style += ";"
    }
    html += " <div id=\"_qbfthc" + grid.index + "\""
    html += " class=\"_qbfthc-" + grid.theme + "\""
    html += " style=\"" + style + "\""
    html += ">"
    const colIndex = 0
    // -- HEADER
    grid.columnMap.forEach( (column: QbfGridColumn) => {
      html += column.header.buildHeaderHtml( )
    })
    // -- FILTER
    let filterExists = false
    grid.columnList.forEach( (column: QbfGridColumn) => {
      if ( column.definition.filter ) { filterExists = true }
    })
    if ( filterExists ) {
      grid.columnMap.forEach( (column: QbfGridColumn) => {
        html += column.header.buildFilterHtml( column.definition.filter )
      })
    }
    html += "</div>"
    return html
  }

  // ---------------------------------------------------------------
  public static buildAllRightHtml(grid: QbfGridAbstract): string {
  // ---------------------------------------------------------------
    let html = ""
    html += "<div><div></div></div>"
    return html
  }

  // ---------------------------------------------------------------
  public static buildAllIconHtml(grid: QbfGridAbstract): string {
  // ---------------------------------------------------------------
    let html = ""
    html += "<div><div></div></div>"
    return html
  }

  // ---------------------------------------------------------------
  public static updateAllHeaderWidths(grid: QbfGridAbstract, columnWidthList: number[] | null ): void {
  // ---------------------------------------------------------------
    let colWidthList: number[] = []
    if ( columnWidthList ) {
      colWidthList = columnWidthList
    } else {
      grid.columnMap.forEach( (column: QbfGridColumn, colName: string) => {
        colWidthList.push( grid.columnList[column.index].width )
      })
    }
    let gridStyle = ""
    let colIndex = 0
    colWidthList.forEach( (columnWidthValue: number) => {
      const columnWidth = "" + columnWidthValue + "px"
      gridStyle += columnWidth + " " + grid.separatorWidth + "px "
      colIndex++
    })
    const headerGrid = QbForm.getElementById("_qbfthc" + grid.index )
    if ( headerGrid ) {
      headerGrid.style.gridTemplateColumns = gridStyle
    }
  }

  // ---------------------------------------------------------------
  public static sort(gridId: number, colIndex: number): void {
  // --------------------------------------------------------------
    // - - - - - - - - - - - - - - - - -
    // Update internal data
    // - - - - - - - - - - - - - - - - -
    const grid = QbfGridAbstract.gridList[gridId]
    const oldSortedColIndex = grid.sortedCol
    const newSortedColIndex = colIndex
    const oldSortMode = grid.sortMode
    let newSortMode = QbfGridColumnSortMode.DOWN
    if ( oldSortedColIndex === newSortedColIndex && oldSortMode === QbfGridColumnSortMode.DOWN ) {
      newSortMode = QbfGridColumnSortMode.UP
    }
    grid.sortedCol = newSortedColIndex
    grid.sortMode = newSortMode

    // - - - - - - - - - - - - - - - - -
    // -- Update Header display
    // - - - - - - - - - - - - - - - - -
    let oldHeader = null
    if ( oldSortedColIndex >= 0 ) {
      oldHeader = grid.columnList[oldSortedColIndex].header
    }
    const newHeader = grid.columnList[newSortedColIndex].header
    if ( oldHeader && oldHeader !== newHeader ) {
      oldHeader.updateHtml()
    }
    newHeader.updateHtml()

    const gridMask = QbForm.getElementById("_qbft_mask_" + gridId )
    if ( gridMask ) {
      gridMask.style.visibility = "visible"
    }
    // - - - - - - - - - - - - - - - - -
    // Calculated new line order
    // - - - - - - - - - - - - - - - - -
    // -- build a temporary array with [line_number] / [sorted cell value]
    const aSorterArray: QbfGridTmpSortLine[] = []
    const bAscOrder = true
    let lineId = 1
    const colName = grid.columnList[colIndex].definition.name
    grid.data.rowList.forEach( (row: QbfGridRow) => {
      const cell = row.cellMap.get(colName)
      aSorterArray.push( new QbfGridTmpSortLine(lineId, cell))
      lineId++
    })

    // -- sort the temporary array
    // const colType = grid.columnList[colIndex].definition.type
    if ( newSortMode === QbfGridColumnSortMode.UP ) {
      aSorterArray.sort( (line1: QbfGridTmpSortLine, line2: QbfGridTmpSortLine) => {
        return line1.value.compareTo( line2.value )
      } )
    } else {
    aSorterArray.sort( (line1: QbfGridTmpSortLine, line2: QbfGridTmpSortLine) => {
      return - ( line1.value.compareTo( line2.value ) )
      } )
    }
    // Update the row list
    const newRowList: QbfGridRow[] = []
    aSorterArray.forEach( (line: QbfGridTmpSortLine) => {
      const row = grid.data.rowList[line.lineID - 1]
      row.index = newRowList.length + 1
      newRowList.push(row)
    })
    grid.data.rowList = newRowList

    // Update display
    const gridData = QbForm.getElementById( "_qbftdc" + gridId )
    if (gridData ) {
      let html = ""
      grid.data.rowList.forEach( (row: QbfGridRow) => {
        html += row.buildCenterHtml()
      })
      gridData.innerHTML = html
    }

    if ( gridMask ) {
      gridMask.style.visibility = "hidden"
    }
  }

  // **************************************
  // QbfGridHeader: instance
  // **************************************
  public column: QbfGridColumn
  public qbfFilter: QbfGridFilter | null
  public headerSeparator: QbfGridHeaderSeparator
  public filterSeparator: QbfGridHeaderSeparator

  // ---------------------------------------------------------------
  public constructor(column: QbfGridColumn ) {
  // ---------------------------------------------------------------
    this.column         = column
    this.qbfFilter = null
    this.headerSeparator      = new QbfGridHeaderSeparator( this )
    this.filterSeparator      = new QbfGridHeaderSeparator( this )
    if ( column.definition.filter ) {
      this.qbfFilter = new QbfGridFilter( this )
    }
  }

  // ---------------------------------------------------------------
  public updateHtml(): void {
  // ---------------------------------------------------------------
    const column = this.column
    const grid = column.grid
    const colIndex = column.index
    const divId = "_qbfthc" + grid.index + "_" + colIndex
    const div = QbForm.getElementById(divId)
    if (div) {
      const textDiv = div.firstElementChild
      if ( textDiv ) {
        let html = ""
        html += column.definition.label
        if ( grid.sortedCol === colIndex ) {
          if ( grid.sortMode === QbfGridColumnSortMode.UP ) {
            html += "<span class=\"_qbfthc-" + grid.theme + "_arrowUp\"><div></div></span>"
          }
          if ( grid.sortMode === QbfGridColumnSortMode.DOWN ) {
            html += "<span class=\"_qbfthc-" + grid.theme + "_arrowDown\"><div></div></span>"
          }
        }
        textDiv.innerHTML = html
      }
    }
  }

  // ---------------------------------------------------------------
  public buildHeaderHtml(): string {
  // ---------------------------------------------------------------
    let html = ""
    const column = this.column
    const grid = column.grid
    const colIndex = column.index

    let divClassList = ""
    if ( this.column.definition.sortable ) {
      divClassList = "class=\""
      divClassList += " _qbfth-" + grid.theme + "-active"
      divClassList += " _qbfth-" + grid.theme + "-sortable"
      divClassList += "\""
    }
    const divId = "_qbfthc" + grid.index + "_" + colIndex
    // html += "<div id="" + tdAndClassId +"" class="" + tdAndClassId + """
    html += "<div id=\"" + divId + "\""
    html += " " + divClassList
    if ( this.column.definition.sortable ) {
      html += "  onclick=\"QbForm.getClass('QbfGridHeader').sort(" + grid.index + "," + column.index + ")\""
    }
    html += ">"
    html +=  "<div class=\"_qbfthc-" + grid.theme + "_text\">"
    html +=  column.definition.label
    html += "</div>"
    html += "</div>"
    // separator
    const sep = this.headerSeparator
    html += "<div id=\"" + sep.getDivId() + "\" class=\"_qbfth-" + grid.theme + "_separator\">"
    html += "  <div class=\"_qbfth-" + grid.theme + "_separator_safeZone\"></div>"
    html += "  <div class=\"_qbfth-" + grid.theme + "_separator_hotSpot\">"
    html += sep.buildHtml()
    html += "  </div>"
    html += "</div>"

    return html
  }

  // ---------------------------------------------------------------
  public buildFilterHtml( filterExists: boolean): string {
  // ---------------------------------------------------------------
    let html = ""
    const column = this.column
    const grid = column.grid
    const colIndex = column.index

    // header
    if ( this.qbfFilter && filterExists ) {
      html += this.qbfFilter.buildCellHtml( )
    } else {
      const theme = column.grid.theme
      const className = "_qbftFilterCell-" + theme
      html += "<div class=\"" + className + "\"><div></div></div>"
    }

    // separator
    const sep = this.filterSeparator
    html += "<div id=\"" + sep.getDivId() + "\" class=\"_qbfth-" + grid.theme + "_separator\">"
    html += "  <div class=\"_qbfth-" + grid.theme + "_separator_safeZone\"></div>"
    html += "  <div class=\"_qbfth-" + grid.theme + "_separator_hotSpot\">"
    html += sep.buildHtml()
    html += "  </div>"
    html += "</div>"

    return html
  }
}
