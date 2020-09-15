import {
    IMpParseAttrAdapter,
    MpPlatform,
    MpXmlElementAttr,
    ParseAttrAdapterArg,
    MpViewSyntaxSpec,
    MkValidateMessagePosition,
} from "@mpkit/types";
import { hasAttr } from "../util";
import throwError from "../throw";
import { ATTR_WHERE_NOT_IF } from "../message";
import MpBaseParseAttrAdapter from "./attr-base";

// 处理条件语句
export default class MpParseWehreAttrAdapter
    extends MpBaseParseAttrAdapter
    implements IMpParseAttrAdapter {
    mpPlatform: MpPlatform;
    mpViewSyntax: MpViewSyntaxSpec;
    ifValue: string;
    elseifValue: string;
    elseValue: string;
    allowMoreContentVar: boolean = false;
    constructor(mpPlatform: MpPlatform) {
        super(mpPlatform);
        const spec = this.mpViewSyntax;
        this.mpViewSyntax = spec;
        this.ifValue = spec.namespace + spec.if;
        this.elseifValue = spec.namespace + spec.elseif;
        this.elseValue = spec.namespace + spec.else;
    }
    parse(data: ParseAttrAdapterArg): MpXmlElementAttr {
        const { currentAttr, currentElementIndex, brotherElements } = data;
        const attrName = currentAttr.name;
        if (attrName === this.elseifValue) {
            const brotherElement = brotherElements[currentElementIndex - 1];
            if (!brotherElement || !hasAttr(brotherElement, this.ifValue)) {
                return throwError({
                    message: ATTR_WHERE_NOT_IF,
                    position: MkValidateMessagePosition.attr,
                    target: currentAttr,
                });
            }
        }
        if (attrName === this.elseValue) {
            const brotherElement = brotherElements[currentElementIndex - 1];
            if (
                !brotherElement ||
                (!hasAttr(brotherElement, this.ifValue) &&
                    !hasAttr(brotherElement, this.elseifValue))
            ) {
                return throwError({
                    message: ATTR_WHERE_NOT_IF,
                    position: MkValidateMessagePosition.attr,
                    target: currentAttr,
                });
            }
        }
        const attr = (data.currentAttr as unknown) as MpXmlElementAttr;
        const content = this.parseContent(data);
        if (Array.isArray(content)) {
            attr.content = content;
        }
        return attr;
    }
}
