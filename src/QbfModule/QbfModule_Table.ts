import QbForm from "./QbForm"

import QbfGridAbstract from "../QbfGridAbstract/QbfGridAbstract"
import QbfGridData from "../QbfGridAbstract/QbfGridData"
import QbfGridHeader from "../QbfGridAbstract/QbfGridHeader"
import QbfGridRow from "../QbfGridAbstract/QbfGridRow"
import { QbfSelectorImpl } from "./QbfSelector"

// ===========================================================
// tslint:disable-next-line: class-name
export default class QbfModule_Table {
// ===========================================================

  // ---------------------------------------------------------
  public static init(): void {
  // ---------------------------------------------------------
    // Add selector
    const QbfElementFactory = QbForm.getClass("QbfElementFactory")
    QbfElementFactory.registerSelector( new QbfSelectorImpl() )
    // export Classes via QbForm
    QbForm.setClass("QbfGridAbstract", QbfGridAbstract)
    QbForm.setClass("QbfGridHeader", QbfGridHeader)
    QbForm.setClass("QbfGridRow", QbfGridRow)
    QbForm.setClass("QbfGridData", QbfGridData)
    // static paddingAndBorderWidth_center = 100;
    // 2 event managers
    /*
    addEventListener( "load" , QbfGridAbstract.onLoadAll )
    addEventListener( "resize" , QbfGridAbstract.onResizeAll )
    */
  }
}

QbfModule_Table.init()
