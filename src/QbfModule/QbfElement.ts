import QbForm from "./QbForm"

// ===========================================================
export interface IQbfSchema {
// ===========================================================
  [index: string]: string
}

const QbfElement: any = QbForm.getClass("QbfElement")
export default QbfElement
