import {
    MpPlatform,
    MpViewSyntaxSpec,
    MkXmlNode,
    MkXmlParseMessagePosition,
    IMkMpXmlAttrParseAdapter,
    MkXmlContentParseResult,
} from "@mpkit/types";
import MpSpec from "../spec";
import { parseContent } from "../util";
import { FxNode } from "forgiving-xml-parser";

export class MkBaseAttrParseAdapter implements IMkMpXmlAttrParseAdapter {
    mpPlatform: MpPlatform;
    mpViewSyntax: MpViewSyntaxSpec;
    onlyDynamicContent: boolean; // 属性内容仅允许存在动态内容，不算动态内容前后的空白字符
    allowMoreDynamicContent: boolean = true; // 是否允许属性content存在多个动态变量({{var}})
    constructor(mpPlatform: MpPlatform) {
        this.mpPlatform = mpPlatform;
        const spec = MpSpec.ViewSyntax[this.mpPlatform];
        this.mpViewSyntax = spec;
    }
    parse(attr: FxNode): MkXmlNode {
        if ("content" in attr && attr.content.length) {
            (attr as MkXmlNode).mpContents = this.parseContent(attr).contents;
        }
        return attr;
    }
    parseContent(attr: FxNode): MkXmlContentParseResult {
        return parseContent(attr.content, MkXmlParseMessagePosition.attr, attr);
    }
}
