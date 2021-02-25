import {
    MpPlatform,
    MpViewSyntaxSpec,
    MkXmlNode,
    IMkMpXmlAttrParseAdapter,
    LikeFxParseContext,
} from "@mpkit/types";
import { mpViewSyntaxSpec } from "../spec";
import { FxNodeJSON } from "forgiving-xml-parser";
import { parseMpXmlContent } from "../content";

export class MkBaseAttrParseAdapter implements IMkMpXmlAttrParseAdapter {
    mpPlatform: MpPlatform;
    mpViewSyntax: MpViewSyntaxSpec;
    constructor(mpPlatform: MpPlatform) {
        this.mpPlatform = mpPlatform;
        const spec = mpViewSyntaxSpec[this.mpPlatform];
        this.mpViewSyntax = spec;
    }
    parse(
        attr: FxNodeJSON,
        parent?: FxNodeJSON | LikeFxParseContext,
        grandpa?: FxNodeJSON | LikeFxParseContext
    ): MkXmlNode {
        if ("content" in attr && attr.content) {
            (attr as MkXmlNode).mpContents = parseMpXmlContent(
                attr.content,
                attr
            );
        }
        return attr;
    }
}
