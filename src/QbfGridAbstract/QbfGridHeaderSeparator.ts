import { DraggableElement, DragMode } from "../QbfModule/DraggableElement"
import QbForm from "../QbfModule/QbForm"

import QbfGridColumn from "./QbfGridColumn"
import QbfGridHeader from "./QbfGridHeader"

// ===========================================================
export default class QbfGridHeaderSeparator extends DraggableElement {
// ===========================================================

  // **************************************
  // QbfGridHeaderSeparator: static
  // **************************************
  public static minColumnWidth: number = 10

  // **************************************
  // QbfGridHeaderSeparator: instance
  // **************************************
  public header: QbfGridHeader

  public initX: number = -1
  //
  public gridLeft: number = -1
  public gridTop: number = -1
  public gridHeight: number = -1
  //
  public deltaXmin: number = -1
  public deltaXmax1: number = -1
  public deltaXmax2: number = -1

  // ------------------------------------------------------------
  public constructor(header: QbfGridHeader) {
  // ------------------------------------------------------------
    super()
    this.header = header
    this.setCursor("col-resize")
  }

  // ------------------------------------------------------------
  public getResizerDivHtml(): string {
    // ------------------------------------------------------------
    const theme = this.header.column.grid.theme
    const className = "_qbfth-" + theme + "_separator_box"
    let html = ""
    html += "<div id=\"" + this.getResizerDivId() + "\""
    html += " class=\"" + className + "\""
    html += ">"
    html += "</div>"
    // html += "</div>"
    // document.body.innerHTML +=  html
    return html
  }

  // ------------------------------------------------------------
  public getDivId(): string {
  // ------------------------------------------------------------
    const gridIndex: number = this.header.column.grid.index
    const colIndex: number = this.header.column.index
    return "kths" + gridIndex + "_" +  colIndex
  }

  // ------------------------------------------------------------
  public getResizerDivId(): string {
  // ------------------------------------------------------------
    const gridIndex: number = this.header.column.grid.index
    const colIndex: number = this.header.column.index
    return "kthsr" + gridIndex + "_" +  colIndex
  }

  // ******************************
  // DraggableElement
  // ******************************

  // Mandatory abstract class
  // ------------------------------------------------------------
  public getInnerHtml( ): string {
  // ------------------------------------------------------------
    // TODO: read width, color and size from CSS/.kth_separator_model
    let html: string = ""
    html += "<div style=\"width: 31px; height: 20px;\"></div>"
    return html
  }

  // ************* DRAG *****************

  // ------------------------------------------------------------
  public recalculateDeltaX(deltaX: number): number {
  // ------------------------------------------------------------
    // Update header sizes
    let result = deltaX
    if ( deltaX < this.deltaMin ) { result = this.deltaMin }
    // if ( delta > this.deltaMax1 + this.deltaMax2 ) { delta = this.deltaMax1 + this.deltaMax2 }
    if ( deltaX > this.deltaMax2 ) { result = this.deltaMax2 }
    return result
  }

  // ------------------------------------------------------------
  public updateSelector(deltaX: number, visible: boolean): void {
  // ------------------------------------------------------------
    // Display the resizer (light blue div on the grid)
    const sepResizer: HTMLElement | null = QbForm.getElementById( this.getResizerDivId() )
    if ( sepResizer ) {
      sepResizer.style.left = "" + this.gridLeft + "px"
      sepResizer.style.top = "" + this.gridTop + "px"
      // sepResizer.style.width = "" + (this.initX+delta-this.gridLeft) + "px"
      // sepResizer.style.height = "" + this.gridHeight + "px"
      const colGrid = this.header.column.grid
      const resizerWidth = this.initX + deltaX - this.gridLeft + this.header.column.index * colGrid.separatorWidth
      sepResizer.style.width = "" + resizerWidth + "px"
    }
    // Update header
    const grid = this.header.column.grid
    const headerIndex = this.header.column.index
    let gridStyle = ""
    grid.columnMap.forEach( (column: QbfGridColumn, colName: string) => {
      let columnWidth = grid.columnList[column.index].width
      if ( column.index === headerIndex ) {
        columnWidth += deltaX
      }
      if ( column.index === headerIndex + 1 ) {
        columnWidth -= deltaX
      }
      gridStyle += columnWidth + "px " + grid.separatorWidth + "px "
    })
    const headerGrid = QbForm.getElementById("_qbfthc" + grid.index )
    if ( headerGrid ) {
      headerGrid.style.gridTemplateColumns = gridStyle
    }
  }

  // ------------------------------------------------------------
  public onDragStart(x: number, y: number, dragMode: typeof DragMode): void {
  // ------------------------------------------------------------
    const colIndex = this.header.column.index
    const grid = this.header.column.grid
    const gridIndex: number = grid.index
    const gridScroll: HTMLElement | null = QbForm.getElementById( "_qbftdc" + gridIndex )
    const gridHtml: HTMLElement | null = QbForm.getElementById( "_qbft" + gridIndex )
    if (gridScroll && gridHtml) {
      const gridScrollRect = gridScroll.getBoundingClientRect()
      const gridHtmlRect = gridHtml.getBoundingClientRect()
      // Calculate gridLeft, gridRight and gridHeight
      // this.gridLeft = gridHtmlRect.x + document.body.scrollLeft
      // this.gridTop  = gridHtmlRect.y + document.body.scrollTop
      this.gridLeft = 0
      const qbfthl = QbForm.getElementById("_qbfthl" + gridIndex)
      if (qbfthl) {
        this.gridLeft = qbfthl.offsetWidth
      }
      this.gridTop = 0
      const gridHeight1 = gridHtmlRect.height
      const gridHeight2 = gridScrollRect.top + gridScrollRect.height - gridHtmlRect.top
      this.gridHeight = (gridHeight1 < gridHeight2 ) ? gridHeight1 : gridHeight2
      // Calculate this.initX, deltaXmin, deltaXmax1, deltaXmax2
      let totalHeaderWidth = 0
      this.initX = this.gridLeft
      this.deltaMax1 = 0
      this.deltaMax2 = 10000
      for (let curColIndex = 0; curColIndex < grid.columnList.length; curColIndex++) {
        totalHeaderWidth += grid.columnList[curColIndex].width
        if ( curColIndex <= colIndex ) {
          this.initX += grid.columnList[curColIndex].width
        }
        if ( curColIndex === colIndex ) {
          this.deltaMin = - grid.columnList[curColIndex].width + QbfGridHeaderSeparator.minColumnWidth
        }
        if (curColIndex === (colIndex + 1) ) {
          this.deltaMax2 = grid.columnList[curColIndex].width - QbfGridHeaderSeparator.minColumnWidth
        }
      }
      this.deltaMax1 = grid.maxWidth - totalHeaderWidth - 1
      if ( this.deltaMax1 < 0 ) { this.deltaMax1 = 0 }
      if ( this.deltaMax2 < 0 ) { this.deltaMax2 = 0 }
      // Update
      const sepResizer: HTMLElement | null = QbForm.getElementById( this.getResizerDivId() )
      if (sepResizer) {
        const theme = this.header.column.grid.theme
        const className = "_qbfth-" + theme + "_separator_box_active"
        sepResizer.classList.add(className)
      }
      this.updateSelector(0, true)
    }
  }

  // ------------------------------------------------------------
  public onDragMove(deltaXinit: number, deltaY: number): void {
  // ------------------------------------------------------------
    const deltaX = this.recalculateDeltaX(deltaXinit)
    this.updateSelector(deltaX, true)
  }

  // ------------------------------------------------------------
  public onDragEnd(deltaXinit: number, deltaY: number): void {
  // ------------------------------------------------------------
    const grid = this.header.column.grid
    // Update sepResizerDisplay
    const sepResizer: HTMLElement | null = QbForm.getElementById( this.getResizerDivId() )
    if (sepResizer) {
      const theme = this.header.column.grid.theme
      const className = "_qbfth-" + theme + "_separator_box_active"
      sepResizer.classList.remove(className)
    }
    const deltaX = this.recalculateDeltaX(deltaXinit)
    this.updateSelector(deltaX, false)
    // Update column width values
    const headerIndex = this.header.column.index
    for (let i = 0; i < grid.columnList.length; i++) {
      let columnWidth = grid.columnList[i].width
      if ( i === headerIndex ) {
        columnWidth += deltaX
      }
      if ( i === headerIndex + 1 ) {
        columnWidth -= deltaX
      }
      grid.columnList[i].width = columnWidth
    }
    grid.data.resizeAllColumnWidths()
    grid.appendQbfRow?.resizeAllColumnWidths()
    grid.updateMainTableLayout()
  }
}
