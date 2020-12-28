import {
    MpPlatform,
    MpViewSyntaxSpec,
    MkXmlNode,
    IMkMpXmlAttrParseAdapter,
    MkXmlParseMessagePosition,
} from "@mpkit/types";
import { hasAttr } from "../util";
import throwError from "../throw";
import { ATTR_ELSE_HAS_CONTENT, ATTR_WHERE_NOT_IF } from "../message";
import { MkBaseAttrParseAdapter } from "./attr-base";
import { FxCursorPosition, FxNodeJSON } from "forgiving-xml-parser";
import { CursorInitValue } from "../var";

// 处理条件语句
export default class MpParseWehreAttrAdapter
    extends MkBaseAttrParseAdapter
    implements IMkMpXmlAttrParseAdapter {
    mpPlatform: MpPlatform;
    mpViewSyntax: MpViewSyntaxSpec;
    ifValue: string;
    elseifValue: string;
    elseValue: string;
    allowMoreContentVar: boolean = false;
    constructor(mpPlatform: MpPlatform) {
        super(mpPlatform);
        const spec = this.mpViewSyntax;
        this.ifValue = spec.namespace + spec.if;
        this.elseifValue = spec.namespace + spec.elseif;
        this.elseValue = spec.namespace + spec.else;
    }
    parse(
        attr: FxNodeJSON,
        parent?: FxNodeJSON,
        grandpa?: FxNodeJSON
    ): MkXmlNode {
        const attrName = attr.name;
        const parentSiblings =
            grandpa && grandpa.children ? grandpa.children : null;
        const parentIndex = parentSiblings
            ? parentSiblings.findIndex((item) => item === parent)
            : -1;
        const parentPrevSibling =
            parentIndex > 0 ? parentSiblings[parentIndex - 1] : null;
        if (attrName === this.elseifValue || attrName === this.elseValue) {
            const hasPrevWhere =
                parentPrevSibling &&
                (attrName === this.elseifValue
                    ? hasAttr(parentPrevSibling, this.ifValue)
                    : hasAttr(parentPrevSibling, this.ifValue) ||
                      hasAttr(parentPrevSibling, this.elseifValue));
            if (!parentPrevSibling || !hasPrevWhere) {
                const cursor: FxCursorPosition = attr.locationInfo
                    ? {
                          offset: attr.locationInfo.startOffset,
                          column: attr.locationInfo.startColumn,
                          lineNumber: attr.locationInfo.startLineNumber,
                      }
                    : CursorInitValue;
                throwError({
                    ...ATTR_WHERE_NOT_IF,
                    ...cursor,
                    target: attr,
                });
            }
        }
        if (attrName === this.elseValue && "content" in attr) {
            const cursor: FxCursorPosition = attr.locationInfo
                ? {
                      offset: attr.locationInfo.startOffset,
                      column: attr.locationInfo.startColumn,
                      lineNumber: attr.locationInfo.startLineNumber,
                  }
                : CursorInitValue;
            throwError({
                ...ATTR_ELSE_HAS_CONTENT,
                ...cursor,
                target: attr,
            });
        }
        return super.parse.apply(this, arguments);
    }
}
