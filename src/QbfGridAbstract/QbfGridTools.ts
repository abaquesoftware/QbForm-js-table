import QbfGridAbstract from "./QbfGridAbstract"
import QbForm from "../QbfModule/QbForm"

// ===========================================================
interface CssArrayItf {
// ===========================================================
  [index: string]: string;
}
  

// ===============================================================
export default class QbfGridTools {
// ===============================================================

  // ===============================================================
  // QbfGridTools static Functions
  // ===============================================================

  //--------------------------------------------------------------
  static setElementWidth (elementId: string, width: number): void
  // --------------------------------------------------------------
  {
    let xElement = QbForm.getElementById( elementId )
    if( xElement ) {
      xElement.style.width= width + "px";
      xElement.style.maxWidth= width + "px";
      xElement.style.minWidth= width + "px";
    } else {
      alert( "Element \"" + elementId + "\" doesn't exist" )
    }
  }

  // --------------------------------------------------------------
  static getClientWidth (elementId: string): number
  // --------------------------------------------------------------
  {
    let result = -1
    let element = QbForm.getElementById( elementId )
    if(element) {
      let xElementRect = element.getBoundingClientRect()
      result = xElementRect.right - xElementRect.left
    } else {
      alert( "Error : no element : " + elementId )
    }
    return result
  }

  // --------------------------------------------------------------
  static getElementWidth (elementId: string): number
  // --------------------------------------------------------------
  {
    let result = -1
    let element = QbForm.getElementById( elementId )
    if( element ) {
      let xElementRect = element.getBoundingClientRect();
      // result = xElementRect.bottom - xElementRect.top
      result = xElementRect.right - xElementRect.left
    } else {
      alert( "Error : no element : " + elementId )
    }
    return result
  }

  // --------------------------------------------------------------
  static getInnerClientWidth (elementId: string): number
  // --------------------------------------------------------------
  {
    let result = -1
    let element = QbForm.getElementById( elementId )
    if( element ) {
      result = element.clientWidth
    } else {
      alert( "Error : no element : " + elementId )
    }
    return result
  }

  // --------------------------------------------------------------
  static getInnerClientHeight (elementId: string): number {
  // --------------------------------------------------------------
    let result = -1
    let element = QbForm.getElementById( elementId )
    if( element ) {
      result = element?.clientHeight
    } else {
      alert( "Error : no element : " + elementId )
    }
    return result
  }

  // --------------------------------------------------------------
  static mydump (arr: any,level: number): string {
  // --------------------------------------------------------------
    let dumped_text: string = "";
    if(!level) level = 0;
    let level_padding = "";
    for(let j=0;j<level+1;j++) level_padding += "    ";
    if(typeof(arr) == "object") {  
      for(let item in arr) {
        let value = arr[item];
        // if(typeof(value) == "object") { 
        //   dumped_text += level_padding + """ + item + "" ...\n";
        //   dumped_text += mydump(value,level+1);
        // } else
        //            
        {
          dumped_text += level_padding + "\"" + item + "\" => \"" + value + "\"\n"
        }
      }
    } else { 
      dumped_text = "===>" + arr + "<===(" + typeof(arr) + ")"
    }
    return dumped_text
  }



  // --------------------------------------------------------------
  static getCssRule (className: string): CSSStyleRule | null
  // --------------------------------------------------------------
  {
    let result = null
    let xCssRule = null
    for ( let i = 0; i < document.styleSheets.length; i++) {
      let bOk = false
      try {
        let styleSheet: CSSStyleSheet = document.styleSheets[i]
        xCssRule = styleSheet.rules
        bOk = true
      }
      catch(e) {
        if(e.name !== "SecurityError") { throw e }
      }
      if( bOk && xCssRule ) {
        for (let j = 0; j < xCssRule.length; j++) {
          let cssRule: CSSRule = xCssRule[j]
          if( cssRule instanceof CSSStyleRule) {
            if (cssRule.selectorText == className ) {
              let cssStyleRule = xCssRule[j] as CSSStyleRule
              result = cssStyleRule
            }
          }
        }
      }
    }
    return result
  }

  // --------------------------------------------------------------
  static getCssRuleDefinition( className: string ): string | null {
  // --------------------------------------------------------------
    let result = null
    let property = QbfGridTools.getCssRule( className );
    if( property ) result = property.style["cssText"];
    return result;
  }

  // --------------------------------------------------------------
  static setCssRuleParam (myclass: string, element: any, value: any ): void {
  // --------------------------------------------------------------
    let property = QbfGridTools.getCssRule(myclass)
    if( property )
      property.style[element] = value
  }

  // --------------------------------------------------------------
  static getCssRuleParam( myclass: string, element: any): any | null
  // --------------------------------------------------------------
  {
    var result = null
    var property = QbfGridTools.getCssRule(myclass)
    if( property ) result = property.style[element]
    return result
  }
  
  // --------------------------------------------------------------
  static addRule(grid: QbfGridAbstract, name: string, cssRuleDefinition: string ): CSSStyleRule | null
  // --------------------------------------------------------------
  {
    let style = grid.style
    if(style && style.sheet) {
      style.sheet.insertRule( name + "{" + cssRuleDefinition + "}" , 0 )
    }
    return QbfGridTools.getCssRule( name )
  }
}
