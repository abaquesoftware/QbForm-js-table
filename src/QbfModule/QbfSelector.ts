import QbfElement, {IQbfSchema} from "./QbfElement"
import QbForm from "./QbForm"

import QbfList from "../QbfList/QbfList"
import QbfTable from "../QbfTable/QbfTable"

// ============================================================================
export default interface IQbfSelector {
// ============================================================================
  findElementClass(schema: IQbfSchema): (new (wbForm: (typeof QbForm),
                                              parent: (typeof QbfElement) | null,
                                              name: string,
                                              inTable: boolean,
                                              schema: IQbfSchema) => (typeof QbfElement)) | null

  getPriority(): number
}

// ============================================================================
export class QbfSelectorImpl implements IQbfSelector {
// ============================================================================

  // --------------------------------------------------------------------------
  public findElementClass(schema: IQbfSchema): (new  (qbForm: (typeof QbForm),
                                                      parent: (typeof QbfElement) | null,
                                                      name: string,
                                                      inTable: boolean,
                                                      schema: IQbfSchema) => (typeof QbfElement)) | null {
  // --------------------------------------------------------------------------
    let result = null
    let type = schema.type
    if (type) {
      type = type.toString().toUpperCase()
      if (type === "ARRAY" && schema.items && (typeof schema.items === "object") ) {
        const itemSchema = schema.items as IQbfSchema
        let subType = itemSchema.type
        if (subType) {
          subType = subType.toUpperCase()
          switch (subType ) {
            case "OBJECT":
              result = QbfTable
              break
            case "ARRAY":
              result = QbfTable
              break
            default:
              result = QbfList
          }
        }
      }
    }
    return result
  }

  // --------------------------------------------------------------------------
  public getPriority(): number {
  // --------------------------------------------------------------------------
    return 1
  }
}
