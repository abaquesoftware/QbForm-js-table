import QbForm from "./QbForm"

// ===============================================================================
export enum QbfBooleanValue {
// ===============================================================================
  UNKNOWN = -1,
  FALSE = 0,
  TRUE = 1,
}

const QbfBoolean: any = QbForm.getClass("QbfBoolean")
export default QbfBoolean
