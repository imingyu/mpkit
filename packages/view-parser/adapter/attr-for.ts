import {
    IMpParseAttrAdapter,
    MpPlatform,
    MpXmlElementAttr,
    ParseAttrAdapterArg,
    MkValidateMessagePosition,
    MpXmlContentType,
    MpXmlContent,
    MpForAttrContent,
    MkXmlElementAttr,
} from "@mpkit/types";
import {
    ATTR_FOR_INDEX_NOT_FOR,
    ATTR_FOR_ITEM_NOT_FOR,
    ATTR_KEY_CONTENT_HAS_BRAKET,
    ATTR_FOR_NOT_LISTVAR,
    ATTR_FOR_EACH_VAR_WRONG,
    ATTR_FOR_VAR_EQUAL,
} from "../message";
import { hasAttr } from "../util";
import throwError from "../throw";
import MpBaseParseAttrAdapter from "./attr-base";
// 处理循环语句
export default class MpParseForAttrAdapter
    extends MpBaseParseAttrAdapter
    implements IMpParseAttrAdapter {
    forValue: string;
    forItemValue: string;
    forIndexValue: string;
    forKeyValue: string;
    allowMoreContentVar: boolean = false;
    constructor(mpPlatform: MpPlatform) {
        super(mpPlatform);
        this.mpPlatform = mpPlatform;
        const spec = this.mpViewSyntax;
        this.forValue = spec.namespace + spec.for;
        this.forItemValue = spec.namespace + spec.forItem;
        this.forIndexValue = spec.namespace + spec.forIndex;
        this.forKeyValue = spec.namespace + spec.key;
    }
    mergeForContent(
        content: MpForAttrContent,
        key: string,
        attr?: MkXmlElementAttr
    ) {
        if (attr && attr.content && attr.content.trim()) {
            content[key] = attr.content.trim();
        }
    }
    getAttrValue(attr?: MkXmlElementAttr, defaultValue: string = ""): string {
        return attr && attr.content && attr.content.trim()
            ? attr.content.trim()
            : defaultValue;
    }
    mergeEachVar(
        eachVar: string,
        data: ParseAttrAdapterArg,
        forAttrContent: MpForAttrContent,
        forItemAttr: MkXmlElementAttr,
        forIndexAttr: MkXmlElementAttr,
        hasIn: boolean
    ) {
        let itemVal;
        let indexVal;
        eachVar = eachVar.trim();
        if (eachVar.indexOf(",") !== -1) {
            const arr = this.splitString(eachVar, ",").filter((item) => item);
            if (!arr.length && hasIn) {
                return throwError({
                    message: ATTR_FOR_EACH_VAR_WRONG,
                    position: MkValidateMessagePosition.attr,
                    target: data.currentAttr,
                });
            }
            itemVal = arr[0] || this.getAttrValue(forItemAttr);
            indexVal = arr[1] || this.getAttrValue(forIndexAttr);
        } else if (eachVar) {
            itemVal = hasIn
                ? eachVar || this.getAttrValue(forItemAttr)
                : this.getAttrValue(forItemAttr);
            indexVal = this.getAttrValue(forIndexAttr);
        } else if (hasIn) {
            return throwError({
                message: ATTR_FOR_EACH_VAR_WRONG,
                position: MkValidateMessagePosition.attr,
                target: data.currentAttr,
            });
        }
        if (hasIn && (!itemVal || !indexVal)) {
            return throwError({
                message: ATTR_FOR_EACH_VAR_WRONG,
                position: MkValidateMessagePosition.attr,
                target: data.currentAttr,
            });
        }
        if (itemVal) {
            forAttrContent.featureItem = itemVal;
        }
        if (indexVal) {
            forAttrContent.featureIndex = indexVal;
        }
    }
    splitString(str: string, char: string): string[] {
        return str.split(char).map((item) => item.trim());
    }
    parseForAttrContent(
        data: ParseAttrAdapterArg,
        forAttrContent: MpXmlContent
    ): MpForAttrContent {
        const result = forAttrContent as MpForAttrContent;
        if (typeof forAttrContent.value !== "string") {
            return throwError({
                message: ATTR_FOR_NOT_LISTVAR,
                position: MkValidateMessagePosition.attr,
                target: data.currentAttr,
            });
        }
        const attrVal = forAttrContent.value.trim();
        if (!attrVal) {
            return throwError({
                message: ATTR_FOR_NOT_LISTVAR,
                position: MkValidateMessagePosition.attr,
                target: data.currentAttr,
            });
        }
        const forItemAttr = data.allAttrs.find(
            (item) => item.name === this.forItemValue
        );
        const forIndexAttr = data.allAttrs.find(
            (item) => item.name === this.forIndexValue
        );

        if (
            this.mpPlatform === MpPlatform.wechat ||
            this.mpPlatform === MpPlatform.alipay ||
            this.mpPlatform === MpPlatform.tiktok
        ) {
            const forKeyAttr = data.allAttrs.find(
                (item) => item.name === this.forKeyValue
            );
            result.featureList = attrVal;
            this.mergeForContent(result, "featureItem", forItemAttr);
            this.mergeForContent(result, "featureKey", forKeyAttr);
            this.mergeForContent(result, "featureIndex", forIndexAttr);
        } else if (this.mpPlatform === MpPlatform.smart) {
            // 百度小程序语法：s-for="item,index in list trackBy index"
            const [valMain, valKey] = this.splitString(attrVal, "trackBy");
            if (valKey) {
                result.featureKey = valKey;
            }
            if (valMain.indexOf(" in ") !== -1) {
                const [eachVar, listVar] = this.splitString(valMain, " in ");
                if (!listVar) {
                    return throwError({
                        message: ATTR_FOR_NOT_LISTVAR,
                        position: MkValidateMessagePosition.attr,
                        target: data.currentAttr,
                    });
                }
                result.featureList = listVar;
                this.mergeEachVar(
                    eachVar,
                    data,
                    result,
                    forItemAttr,
                    forIndexAttr,
                    true
                );
            } else {
                this.mergeEachVar(
                    valMain,
                    data,
                    result,
                    forItemAttr,
                    forIndexAttr,
                    false
                );
                result.featureList = valMain;
            }
        }
        return result;
    }
    validateForVarName(forContent: MpForAttrContent, attr: MpXmlElementAttr) {
        ["featureItem", "featureIndex", "featureList"].forEach(
            (item, index, arr) => {
                const val = forContent[item];
                if (val) {
                    const equalItem = arr
                        .filter((t) => t !== item)
                        .find((t) => forContent[t] === val);
                    if (equalItem) {
                        return throwError({
                            message: ATTR_FOR_VAR_EQUAL,
                            position: MkValidateMessagePosition.attr,
                            target: attr,
                        });
                    }
                }
            }
        );
    }
    parse(data: ParseAttrAdapterArg): MpXmlElementAttr {
        const { currentAttr, currentElement } = data;
        const attrName = currentAttr.name;
        if (attrName === this.forItemValue) {
            // for-item一定要与for属性一同出现
            if (!hasAttr(currentElement, this.forValue)) {
                return throwError({
                    message: ATTR_FOR_ITEM_NOT_FOR,
                    position: MkValidateMessagePosition.attr,
                    target: currentAttr,
                });
            }
        }
        if (attrName === this.forIndexValue) {
            // for-index一定要与for属性一同出现
            if (!hasAttr(currentElement, this.forValue)) {
                return throwError({
                    message: ATTR_FOR_INDEX_NOT_FOR,
                    position: MkValidateMessagePosition.attr,
                    target: currentAttr,
                });
            }
        }
        const attr = (data.currentAttr as unknown) as MpXmlElementAttr;
        const contents = this.parseContent(data);
        if (Array.isArray(contents)) {
            if (attrName === this.forValue) {
                const forContent = this.parseForAttrContent(data, contents[0]);
                this.validateForVarName(forContent, attr);
                contents[0] = forContent;
            }
            attr.content = contents;
        }
        if (
            attrName === this.forKeyValue &&
            this.mpViewSyntax.forAndWhereAttrNeedBracket &&
            contents[0].type === MpXmlContentType.dynamic
        ) {
            // key="{{sdf}}"
            return throwError({
                message: ATTR_KEY_CONTENT_HAS_BRAKET,
                position: MkValidateMessagePosition.attr,
                target: currentAttr,
            });
        }
        return attr;
    }
}
