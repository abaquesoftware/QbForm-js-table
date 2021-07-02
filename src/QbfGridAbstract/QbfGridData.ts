import QbForm from "../QbfModule/QbForm"

import QbfGridAbstract from "./QbfGridAbstract"
import QbfGridColumn from "./QbfGridColumn"
import QbfGridRow, {QbfGridRowHighlightedGrid, QbfGridRowHighlightMode} from "./QbfGridRow"

// ===============================================================
export default class QbfGridData {
// ===============================================================

  // **************************************
  // QbfGridData: static (mouse management)
  // **************************************

  // --------------------------------------------------------------
  public static onMouseOverGrid(gridId: number, event: MouseEvent ): void {
  // --------------------------------------------------------------
    const leftPrefix = "_qbftdl"
    const centerPrefix = "_qbftdc"
    const rightPrefix = "_qbftdr"
    const iconPrefix = "_qbftdi"

    let htmlElement: HTMLElement | null = event.target as HTMLElement
    let elementId: string | null = htmlElement.id
    while (htmlElement
            && !elementId.startsWith(leftPrefix)
            && !elementId.startsWith(centerPrefix)
            && !elementId.startsWith(rightPrefix)
            && !elementId.startsWith(iconPrefix) ) {
      htmlElement = htmlElement.parentElement
      if (htmlElement) {
        elementId = htmlElement.id
      }
    }
    if (elementId) {
      // const overLeftGrid = elementId.startsWith(leftPrefix)
      const overCenterGrid = elementId.startsWith(centerPrefix)
      const overRightGrid = elementId.startsWith(rightPrefix)
      const overIconGrid = elementId.startsWith(iconPrefix)
      let cellPrefix = leftPrefix
      let highlightedGrid = QbfGridRowHighlightedGrid.LEFT
      if (overCenterGrid) {
        cellPrefix = centerPrefix
        highlightedGrid = QbfGridRowHighlightedGrid.CENTER
      }
      if (overRightGrid) {
        cellPrefix = rightPrefix
        highlightedGrid = QbfGridRowHighlightedGrid.RIGHT
      }
      if (overIconGrid) {
        cellPrefix = iconPrefix
        highlightedGrid = QbfGridRowHighlightedGrid.ICON
      }
      elementId = elementId.substring(cellPrefix.length)
      if (elementId.indexOf("_") > 0 ) {
        const fields: string[] = elementId.split("_")
        const colId = parseInt(fields[1], 10)
        const rowId = parseInt(fields[2], 10)
        const grid = QbfGridAbstract.gridList[gridId]
        const oldColId = grid.highlightedCol
        const oldRowId = grid.highlightedRow
        grid.highlightedCol = colId
        grid.highlightedRow = rowId
        if (colId !== oldColId || rowId !== oldRowId) {
          if (oldRowId !== -1) {
            QbfGridRow.highlight( QbfGridRowHighlightMode.NO_HIGHLIGHT, grid, highlightedGrid, oldColId, oldRowId )
          }
          if (overIconGrid) {
            QbfGridRow.highlight( QbfGridRowHighlightMode.DELETE, grid, highlightedGrid, colId, rowId )
          } else {
            QbfGridRow.highlight( QbfGridRowHighlightMode.STANDARD, grid, highlightedGrid, colId, rowId )
          }
      }
      }
    }
  }

  // --------------------------------------------------------------
  public static onMouseLeaveGrid(gridId: number, event: MouseEvent ): void {
  // --------------------------------------------------------------
    const grid = QbfGridAbstract.gridList[gridId]
    const oldRowId = grid.highlightedRow
    if ( oldRowId !== -1 ) {
      grid.highlightedRow = -1
      QbfGridRow.highlight(QbfGridRowHighlightMode.NO_HIGHLIGHT, grid,
                           QbfGridRowHighlightedGrid.UNKNOWN, -1, oldRowId)
    }
  }

  // **************************************
  // QbfGridData: instance
  // **************************************

  public grid: QbfGridAbstract
  public rowList: QbfGridRow[]
  public selectedRows: QbfGridRow[]

  // --------------------------------------------------------------
  public constructor(grid: QbfGridAbstract) {
  // --------------------------------------------------------------
    this.grid         = grid
    this.rowList      = []
    this.selectedRows = []
  }

  // --------------------------------------------------------------
  public buildLeftDivHtml(): string {
  // --------------------------------------------------------------
    let html = ""

    const grid = this.grid
    if ( grid.nbLeftCols > 0 ) {
      let style = ""
      style = "grid-template-columns:"
      if ( grid.lineSorting  ) { style += "20px " }
      if ( grid.lineSelector ) { style += "30px " }
      if ( grid.lineNumber   ) { style += "45px " }
      style += ";"
      // -- fixed columns (left)
      html += "<div id=\"_qbftdl" + grid.index + "\""
      html += " class=\"_qbftdl-" + grid.theme + "\""
      html += " style=\"" + style + "\""
      html += "onMouseMove=\"QbForm.getClass('QbfGridData').onMouseOverGrid(" + grid.index + ",event)\" "
      html += "onMouseLeave=\"QbForm.getClass('QbfGridData').onMouseLeaveGrid(" + grid.index + ",event)\" "
      html += ">"
      this.rowList.forEach( (row: QbfGridRow) => {
        html += row.buildLeftHtml()
      })
      html += "</div>"
    }
    return html
  }

  // --------------------------------------------------------------
  public buildCenterDivHtml(): string {
  // --------------------------------------------------------------
    const grid = this.grid
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
      })
      style += ";"
    }
    let html = ""
    html += "<div id=\"_qbftdc" + grid.index + "\""
    html += " class=\"_qbftdc-" + grid.theme + "\""
    html += " style=\"" + style + "\""
    // html += " onScroll="QbfGridAbstract.onScroll(" + this.index + ")""
    html += "onMouseMove=\"QbForm.getClass('QbfGridData').onMouseOverGrid(" + grid.index + ",event)\" "
    html += "onMouseLeave=\"QbForm.getClass('QbfGridData').onMouseLeaveGrid(" + grid.index + ",event)\" "

    html += ">"
    this.rowList.forEach( (row: QbfGridRow) => {
      html += row.buildCenterHtml()
    })
    html += "</div>"

    return html
  }

  // --------------------------------------------------------------
  public buildRightDivHtml(): string {
  // --------------------------------------------------------------
    const html = ""
    return html
  }

  // --------------------------------------------------------------
  public buildIconDivHtml(): string {
  // --------------------------------------------------------------
    const grid = this.grid
    let html = ""
    html += "<div id=\"_qbftdi" + grid.index + "\""
    html += " class=\"_qbftdi-" + grid.theme + "\""
    html += " onMouseMove=\"QbForm.getClass('QbfGridData').onMouseOverGrid(" + grid.index + ",event)\""
    html += " onMouseLeave=\"QbForm.getClass('QbfGridData').onMouseLeaveGrid(" + grid.index + ",event)\""
    html += ">"
    this.rowList.forEach( (row: QbfGridRow) => {
      html += row.buildIconHtml()
    })
    html += "</div>"
    return html
  }

  // -------------------------------------------------------------
  public empty(): void {
  // -------------------------------------------------------------
    this.rowList = []
    const leftDomObject = QbForm.getElementById( "_qbftdl" + this.grid.index)
    const dataDomObject = QbForm.getElementById( "_qbftdc" + this.grid.index)
    const rightDomObject = QbForm.getElementById( "_qbftdr" + this.grid.index)
    const iconDomObject = QbForm.getElementById( "_qbftdi" + this.grid.index)
    if ( leftDomObject ) {
      leftDomObject.innerHTML = ""
    }
    if ( dataDomObject ) {
      dataDomObject.innerHTML = ""
    }
    if ( rightDomObject ) {
      rightDomObject.innerHTML = ""
    }
    if ( iconDomObject ) {
      iconDomObject.innerHTML = ""
    }
  }

  // ---------------------------------------------------------------
  public resizeAllColumnWidths(): void {
  // ---------------------------------------------------------------
    let gridStyle = ""
    const grid = this.grid
    for (const column of grid.columnList) {
      gridStyle += column.width + "px "
    }
    const dataGrid = QbForm.getElementById("_qbftdc" + this.grid.index )
    if ( dataGrid ) {
      dataGrid.style.gridTemplateColumns = gridStyle
    }
  }

  // --------------------------------------------------------------
  public resizeAllHeights(): void {
  // --------------------------------------------------------------
    const grid = this.grid
    const nbCols = this.grid.columnList.length
    const nbRows = this.rowList.length
    const dataGridDiv = QbForm.getElementById( "_qbftdc" + grid.index )
    if (dataGridDiv && nbCols > 0 && nbRows > 0) {
      // First, use the first line to find delta between offset and client
      const deltaLeft = 0
      const deltaRight = 0
      const deltaIcon = 0
      const heightList: number[] = []
      for (let i = 0 ; i < this.rowList.length ; i++) {
        const dataDiv = dataGridDiv?.children[ i * nbCols ]
        heightList.push( dataDiv.clientHeight )
      }
      // ---- Update row height in left columns
      this.rowList.forEach( (row: QbfGridRow) => {
        const div = dataGridDiv?.children[ (row.index - 1) * nbCols ] as HTMLElement
        let height = 0
        if (div) {
          height = heightList[row.index - 1 ]
        }
        row.setLeftHeight(height + deltaLeft )
        row.setRightHeight(height + deltaRight )
        row.setIconHeight( height + deltaIcon )
      })
    }
  }

  // --------------------------------------------------------------
  public removeRow(rowId: number): void {
  // --------------------------------------------------------------
    this.rowList.splice(rowId - 1, 1)
    for (let i = rowId - 1; i < this.rowList.length; i++) {
      const row = this.rowList[i]
      row.index = i + 1
      row.label = "" + row.index
      // row.displayIndex = row.index
    }
    // Update display
    const leftDiv = QbForm.getElementById("_qbftdl" + this.grid.index + "_mainSubTable")
    const centerDiv = QbForm.getElementById("_qbftdc" + this.grid.index + "_mainSubTable")
    const rightDiv = QbForm.getElementById("_qbftdr" + this.grid.index + "_mainSubTable")
    const iconDiv = QbForm.getElementById("_qbftdi" + this.grid.index + "_mainSubTable")
    if (leftDiv) {
      leftDiv.innerHTML = this.buildLeftDivHtml()
    }
    if (centerDiv) {
      centerDiv.innerHTML = this.buildCenterDivHtml()
    }
    if (rightDiv) {
      rightDiv.innerHTML = this.buildRightDivHtml()
    }
    if (iconDiv) {
      iconDiv.innerHTML = this.buildIconDivHtml()
    }
    this.resizeAllHeights()
    this.grid.updateMainTableLayout()
  }

}
