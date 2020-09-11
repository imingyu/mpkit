import {
    IMpParseAttrAdapter,
    MpPlatform,
    MpXmlElementAttr,
    ParseAttrAdapterArg,
    MkValidateMessagePosition,
    MpXmlContentType,
} from "@mpkit/types";
import {
    ATTR_CONTENT_HAS_MORE_VAR,
    ATTR_FOR_INDEX_NOT_FOR,
    ATTR_FOR_ITEM_NOT_FOR,
} from "@mpkit/view-parser/message";
import { hasAttr, validateContent } from "@mpkit/view-parser/util";
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
    constructor(mpPlatform: MpPlatform) {
        super(mpPlatform);
        this.mpPlatform = mpPlatform;
        const spec = this.mpViewSyntax;
        this.forValue = spec.namespace + spec.for;
        this.forItemValue = spec.namespace + spec.forItem;
        this.forIndexValue = spec.namespace + spec.forIndex;
        this.forKeyValue = spec.namespace + spec.key;
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
        const contents = validateContent(
            currentAttr.content,
            MkValidateMessagePosition.attr,
            currentAttr
        );
        const filterEmpty = contents.filter((item) => {
            if (item.type === MpXmlContentType.dynamic) {
                return true;
            }
            return item.value && item.value.trim();
        });
        if (filterEmpty.length > 1) {
            return throwError({
                message: ATTR_CONTENT_HAS_MORE_VAR,
                position: MkValidateMessagePosition.attr,
                target: currentAttr,
            });
        }
        const attr = (data.currentAttr as unknown) as MpXmlElementAttr;
        attr.content = contents;
        return attr;
    }
}
