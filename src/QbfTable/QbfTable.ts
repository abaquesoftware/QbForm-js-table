import QbfElement, {IQbfSchema} from "../QbfModule/QbfElement"
import QbForm from "../QbfModule/QbForm"

import QbfGridAbstract from "../QbfGridAbstract/QbfGridAbstract"
import QbfGridColumn from "../QbfGridAbstract/QbfGridColumn"

// ===========================================================
export default class QbfTable extends QbfGridAbstract {
// ===========================================================

  // ---------------------------------------------------------
  public constructor(qbForm: typeof QbForm,
                     parent: (typeof QbfElement) | null,
                     name: string,
                     inTable: boolean,
                     schema: IQbfSchema) {
  // ---------------------------------------------------------
    super(qbForm, parent, name, inTable, schema)
    // colmuns
    if (schema.items && (typeof schema.items === "object" )) {
      const itemSchema = schema.items as IQbfSchema
      let itemType = itemSchema.type
      if (itemType) {
        itemType = itemType.toUpperCase()
        if (itemType === "OBJECT") {
          // Cas 1 : subtype = OBJECT
          if (itemSchema.properties && (typeof itemSchema.properties === "object") ) {
            const itemProperties = itemSchema.properties as IQbfSchema
            let colIndex = 0
            for (const property in itemProperties) {
              if (typeof itemProperties[property] === "object") {
                const newColumnDef = itemProperties[property] as unknown as object
                const newColumn: QbfGridColumn = new QbfGridColumn(this, colIndex, property, newColumnDef)
                this.columnMap.set(property, newColumn)
                this.columnList.push(newColumn)
                colIndex++
              }
            }
          }
        }
      }
      if (itemType === "ARRAY") {
        // Cas 2 : subtype = ARRAY
        if (itemSchema.items && (typeof itemSchema.items === "object") ) {
          const itemDefinition = itemSchema.items as IQbfSchema
          let colIndex = 0
          for (const item in itemDefinition) {
            if (typeof itemDefinition[item] === "object" ) {
              const newColumnDef = itemDefinition[item] as unknown as object
              const newColumn: QbfGridColumn = new QbfGridColumn(this, colIndex, "" + item, newColumnDef)
              this.columnMap.set("" + item, newColumn)
              this.columnList.push(newColumn)
              colIndex++
            }
          }
        }
      }
    }
    this.init()
  }
}
