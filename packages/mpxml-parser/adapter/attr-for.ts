import { MpPlatform, MkXmlNode, IMkMpXmlAttrParseAdapter } from "@mpkit/types";
import { ATTR_FOR_INDEX_NOT_FOR, ATTR_FOR_ITEM_NOT_FOR } from "../message";
import { hasAttr } from "../util";
import throwError from "../throw";
import { MkBaseAttrParseAdapter } from "./attr-base";
import { FxCursorPosition, FxNode, FxNodeJSON } from "forgiving-xml-parser";
import { CursorInitValue } from "../var";
// 处理循环语句
export default class MkForAttrParseAdapter
    extends MkBaseAttrParseAdapter
    implements IMkMpXmlAttrParseAdapter {
    forValue: string;
    forItemValue: string;
    forIndexValue: string;
    forKeyValue: string;
    constructor(mpPlatform: MpPlatform) {
        super(mpPlatform);
        this.mpPlatform = mpPlatform;
        const spec = this.mpViewSyntax;
        this.forValue = spec.namespace + spec.for;
        this.forItemValue = spec.namespace + spec.forItem;
        this.forIndexValue = spec.namespace + spec.forIndex;
        if (spec.key) {
            this.forKeyValue = spec.namespace + spec.key;
        }
    }
    // mergeForContent(content: MpForAttrContent, key: string, attr?: FxNode) {
    //     if (attr && attr.content && attr.content.trim()) {
    //         content[key] = attr.content.trim();
    //     }
    // }
    // getAttrValue(attr?: FxNode, defaultValue: string = ""): string {
    //     return attr && attr.content && attr.content.trim()
    //         ? attr.content.trim()
    //         : defaultValue;
    // }
    // mergeEachVar(
    //     eachVar: string,
    //     data: MkParseAttrAdapterArg,
    //     forAttrContent: MpForAttrContent,
    //     forItemAttr: FxNode,
    //     forIndexAttr: FxNode,
    //     hasIn: boolean
    // ) {
    //     let itemVal;
    //     let indexVal;
    //     eachVar = eachVar.trim();
    //     if (eachVar.indexOf(",") !== -1) {
    //         const arr = this.splitString(eachVar, ",").filter((item) => item);
    //         if (!arr.length && hasIn) {
    //             return throwError({
    //                 message: ATTR_FOR_EACH_VAR_WRONG,
    //                 position: MkValidateMessagePosition.attr,
    //                 target: data.currentAttr,
    //             });
    //         }
    //         itemVal = arr[0] || this.getAttrValue(forItemAttr);
    //         indexVal = arr[1] || this.getAttrValue(forIndexAttr);
    //     } else if (eachVar) {
    //         itemVal = hasIn
    //             ? eachVar || this.getAttrValue(forItemAttr)
    //             : this.getAttrValue(forItemAttr);
    //         indexVal = this.getAttrValue(forIndexAttr);
    //     } else if (hasIn) {
    //         return throwError({
    //             message: ATTR_FOR_EACH_VAR_WRONG,
    //             position: MkValidateMessagePosition.attr,
    //             target: data.currentAttr,
    //         });
    //     }
    //     if (hasIn && (!itemVal || !indexVal)) {
    //         return throwError({
    //             message: ATTR_FOR_EACH_VAR_WRONG,
    //             position: MkValidateMessagePosition.attr,
    //             target: data.currentAttr,
    //         });
    //     }
    //     if (itemVal) {
    //         forAttrContent.featureItem = itemVal;
    //     }
    //     if (indexVal) {
    //         forAttrContent.featureIndex = indexVal;
    //     }
    // }
    // splitString(str: string, char: string): string[] {
    //     return str.split(char).map((item) => item.trim());
    // }
    // mergeGeneralForAttrContent(
    //     nativeContent: string,
    //     data: MkParseAttrAdapterArg,
    //     forAttrContent: MpForAttrContent,
    //     forItemAttr: FxNode,
    //     forIndexAttr: FxNode
    // ) {
    //     const forKeyAttr = data.allAttrs.find(
    //         (item) => item.name === this.forKeyValue
    //     );
    //     forAttrContent.featureList = nativeContent;
    //     this.mergeForContent(forAttrContent, "featureItem", forItemAttr);
    //     this.mergeForContent(forAttrContent, "featureKey", forKeyAttr);
    //     this.mergeForContent(forAttrContent, "featureIndex", forIndexAttr);
    // }
    // mergeSmartForAttrContent(
    //     nativeContent: string,
    //     data: MkParseAttrAdapterArg,
    //     forAttrContent: MpForAttrContent,
    //     forItemAttr: FxNode,
    //     forIndexAttr: FxNode
    // ) {
    //     // 百度小程序语法：s-for="item,index in list trackBy index"
    //     const [valMain, valKey] = this.splitString(nativeContent, "trackBy");
    //     if (valKey) {
    //         forAttrContent.featureKey = valKey;
    //     }
    //     if (valMain.indexOf(" in ") !== -1) {
    //         const [eachVar, listVar] = this.splitString(valMain, " in ");
    //         if (!listVar) {
    //             return throwError({
    //                 message: ATTR_FOR_NOT_LISTVAR,
    //                 position: MkValidateMessagePosition.attr,
    //                 target: data.currentAttr,
    //             });
    //         }
    //         forAttrContent.featureList = listVar;
    //         this.mergeEachVar(
    //             eachVar,
    //             data,
    //             forAttrContent,
    //             forItemAttr,
    //             forIndexAttr,
    //             true
    //         );
    //     } else {
    //         this.mergeEachVar(
    //             valMain,
    //             data,
    //             forAttrContent,
    //             forItemAttr,
    //             forIndexAttr,
    //             false
    //         );
    //         forAttrContent.featureList = valMain;
    //     }
    // }
    // parseForAttrContent(
    //     data: MkParseAttrAdapterArg,
    //     forAttrContent: MkXmlContent
    // ): MpForAttrContent {
    //     const result = forAttrContent as MpForAttrContent;
    //     if (typeof forAttrContent.value !== "string") {
    //         return throwError({
    //             message: ATTR_FOR_NOT_LISTVAR,
    //             position: MkValidateMessagePosition.attr,
    //             target: data.currentAttr,
    //         });
    //     }
    //     const attrVal = forAttrContent.value.trim();
    //     if (!attrVal) {
    //         return throwError({
    //             message: ATTR_FOR_NOT_LISTVAR,
    //             position: MkValidateMessagePosition.attr,
    //             target: data.currentAttr,
    //         });
    //     }
    //     const forItemAttr = data.allAttrs.find(
    //         (item) => item.name === this.forItemValue
    //     );
    //     const forIndexAttr = data.allAttrs.find(
    //         (item) => item.name === this.forIndexValue
    //     );

    //     if (
    //         this.mpPlatform === MpPlatform.wechat ||
    //         this.mpPlatform === MpPlatform.alipay ||
    //         this.mpPlatform === MpPlatform.tiktok
    //     ) {
    //         this.mergeGeneralForAttrContent(
    //             attrVal,
    //             data,
    //             result,
    //             forItemAttr,
    //             forIndexAttr
    //         );
    //     } else if (this.mpPlatform === MpPlatform.smart) {
    //         this.mergeSmartForAttrContent(
    //             attrVal,
    //             data,
    //             result,
    //             forItemAttr,
    //             forIndexAttr
    //         );
    //     }
    //     return result;
    // }
    // validateForVarName(forContent: MpForAttrContent, attr: MkXmlNode) {
    //     ["featureItem", "featureIndex", "featureList"].forEach(
    //         (item, index, arr) => {
    //             const val = forContent[item];
    //             if (val) {
    //                 const equalItem = arr
    //                     .filter((t) => t !== item)
    //                     .find((t) => forContent[t] === val);
    //                 if (equalItem) {
    //                     return throwError({
    //                         message: ATTR_FOR_VAR_EQUAL,
    //                         position: MkValidateMessagePosition.attr,
    //                         target: attr,
    //                     });
    //                 }
    //             }
    //         }
    //     );
    // }
    validate(attr: FxNodeJSON, parent?: FxNodeJSON) {
        const attrName = attr.name;
        const attrStartCursor: FxCursorPosition = attr.locationInfo
            ? {
                  offset: attr.locationInfo.startOffset,
                  column: attr.locationInfo.startColumn,
                  lineNumber: attr.locationInfo.startLineNumber,
              }
            : CursorInitValue;
        if (parent) {
            if (
                attrName === this.forItemValue &&
                !hasAttr(parent, this.forValue)
            ) {
                // for-item一定要与for属性一同出现
                throwError({
                    ...ATTR_FOR_ITEM_NOT_FOR,
                    target: attr,
                    ...attrStartCursor,
                });
            }
            if (
                attrName === this.forIndexValue &&
                !hasAttr(parent, this.forValue)
            ) {
                // for-index一定要与for属性一同出现
                return throwError({
                    ...ATTR_FOR_INDEX_NOT_FOR,
                    target: attr,
                    ...attrStartCursor,
                });
            }
        }
    }
    parse(
        attr: FxNodeJSON,
        parent?: FxNodeJSON,
        grandpa?: FxNodeJSON
    ): MkXmlNode {
        this.validate(attr, parent);
        return super.parse.apply(this, arguments);
    }
}
