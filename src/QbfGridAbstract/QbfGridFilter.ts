import QbfFilterAbstract from "../QbfModule/QbfFilterAbstract"
import QbfGridHeader from "./QbfGridHeader"
import QbfGridRow from "./QbfGridRow"

import QbfElement from "../QbfModule/QbfElement"
import QbfElementFactory from "../QbfModule/QbfElementFactory"
import QbForm from "../QbfModule/QbForm"

// ===============================================================
export default class QbfGridFilter extends QbfFilterAbstract {
// ===============================================================
  public header: QbfGridHeader

  // ---------------------------------------------------------------
  public constructor(header: QbfGridHeader) {
  // ---------------------------------------------------------------
    // super(header.column.grid.theme)
    super()
    this.header = header
  }

  // ---------------------------------------------------------------
  public buildCellHtml(): string {
  // ---------------------------------------------------------------
    let html = ""
    const column = this.header.column
    const colSchema = column.definition.cellSchema
    const elementClass = QbfElementFactory.getElementClassFromSchema(colSchema)
    let elementClassName = ""
    QbForm.classMap.forEach ( (curClass: any, className: string) => {
      if (curClass === elementClass ) { elementClassName = className }
    })
    const theme = column.grid.theme
    const className1 = "_qbftFilterCell-" + theme
    const className2 = className1 + "_" + elementClassName
    if (elementClass) {
      html += elementClass.buildFilterCellHtml(this.header.column, this.filterId, className1 + " " + className2 )
    }
    return html
  }

  // ---------------------------------------------------------------
  public apply(): void {
  // ---------------------------------------------------------------
    const column = this.header.column
    const grid = column.grid
    grid.data.rowList.forEach( (row: QbfGridRow) => {
      // let rowId = row.index
      const rowCell: (typeof QbfElement) = row.cellMap.get( column.name ) as (typeof QbfElement)
      row.setVisibility(rowCell.filter(this.data) )
    })
    grid.data.resizeAllHeights()
    grid.updateMainTableLayout()
  }

}
