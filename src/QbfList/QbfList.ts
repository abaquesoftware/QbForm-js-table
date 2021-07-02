import QbfElement, {IQbfSchema} from "../QbfModule/QbfElement"
import QbForm from "../QbfModule/QbForm"

import QbfGridAbstract from "../QbfGridAbstract/QbfGridAbstract"
import QbfGridColumn from "../QbfGridAbstract/QbfGridColumn"

// ===========================================================
export default class QbfList extends QbfGridAbstract {
// ===========================================================
  // ---------------------------------------------------------
  public constructor(qbFormf: typeof QbForm,
                     parent: (typeof QbfElement) | null,
                     name: string,
                     inTable: boolean,
                     schema: IQbfSchema) {
  // ---------------------------------------------------------
    super(qbFormf, parent, name, inTable, schema)
    // colmuns
    if (schema.items) {
      const colIndex = 0
      const columnDef = schema.items as unknown as object
      const newColumn: QbfGridColumn = new QbfGridColumn(this, colIndex, name, columnDef)
      this.columnMap.set(name, newColumn)
      this.columnList.push(newColumn)
    }
    this.init()
  }

  // ---------------------------------------------------------
  public setValue(value: any): void {
  // ---------------------------------------------------------
    // setValue is inherited from KonfTable
    // Rebuild value [ a, b, ...] -> [ [a], [b], ...]
    let newValue = value
    if (Array.isArray(value)) {
      newValue = []
      value.forEach( (rowValue: any) => {
        newValue.push( [ rowValue ] )
      })
    }
    super.setValue(newValue)
  }
}
