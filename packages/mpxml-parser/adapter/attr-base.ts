import {
    MpPlatform,
    MpViewSyntaxSpec,
    MkXmlNode,
    IMkMpXmlAttrParseAdapter,
} from "@mpkit/types";
import MpSpec from "../spec";
import { FxNodeJSON } from "forgiving-xml-parser";
import { parseMpXmlContent } from "../content";

export class MkBaseAttrParseAdapter implements IMkMpXmlAttrParseAdapter {
    mpPlatform: MpPlatform;
    mpViewSyntax: MpViewSyntaxSpec;
    constructor(mpPlatform: MpPlatform) {
        this.mpPlatform = mpPlatform;
        const spec = MpSpec.ViewSyntax[this.mpPlatform];
        this.mpViewSyntax = spec;
    }
    parse(
        attr: FxNodeJSON,
        parent?: FxNodeJSON,
        grandpa?: FxNodeJSON
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
