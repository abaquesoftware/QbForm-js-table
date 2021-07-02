import QbForm from "../QbfModule/QbForm"

import QbfGridAbstract from "./QbfGridAbstract"
import QbfGridColumn from "./QbfGridColumn"
import QbfGridRow from "./QbfGridRow"

// ===============================================================
export default class QbfGridAppendRow extends QbfGridRow {
// ===============================================================

  // --------------------------------------------------------------
  public buildLeftDivHtml(): string {
  // --------------------------------------------------------------
    const html = ""
    return html
  }

  // --------------------------------------------------------------
  public buildCenterDivHtml(): string {
  // --------------------------------------------------------------
    const grid = this.parent as QbfGridAbstract
    let html = ""
    let style = ""
    if (grid.columnMap.size > 0) {
      style = "grid-template-columns:"
      grid.columnMap.forEach( (column: QbfGridColumn, colName: string) => {
        style += "auto "
      })
      style += ";"
      html += "<div id=\"_qbftac" + grid.index + "\""
      html += " class=\"_qbftac-" + grid.theme + "\""
      html += " style=\"" + style + "\""
      html += ">"
      html += this.buildCenterHtml()
      html += "</div>"
    }
    return html
  }

  // --------------------------------------------------------------
  public buildRightDivHtml(): string {
  // --------------------------------------------------------------
    // let grid = this.parent as QbfGridAbstract
    const html = ""
    return html
  }

  // --------------------------------------------------------------
  public buildIconDivHtml(): string {
  // --------------------------------------------------------------
    const grid = this.parent as QbfGridAbstract
    let html = ""
    html += "<div id=\"_qbftai" + grid.index + "\""
    html += " class=\"_qbftai-" + grid.theme + "\""
    html += ">"
    html += this.buildIconHtml()
    html += "</div>"
    return html
  }

  // --------------------------------------------------------------
  public resizeAllColumnWidths(): void {
  // --------------------------------------------------------------
    const grid = this.parent as QbfGridAbstract
    let gridStyle = ""
    for (const columnWidthValue of grid.columnList) {
      gridStyle += columnWidthValue.width + "px "
    }
    const dataGrid = QbForm.getElementById("_qbftac" + grid.index )
    if (dataGrid ) {
      dataGrid.style.gridTemplateColumns = gridStyle
    }
  }

}
