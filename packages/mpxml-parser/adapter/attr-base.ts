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
import { FxNodeJSON } from "forgiving-xml-parser";

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
            (attr as MkXmlNode).mpContents = this.parseContent(attr).contents;
        }
        return attr;
    }
    parseContent(
        attr: FxNodeJSON,
        parent?: FxNodeJSON,
        grandpa?: FxNodeJSON
    ): MkXmlContentParseResult {
        return parseContent(
            attr.content,
            MkXmlParseMessagePosition.attr,
            attr,
            parent,
            grandpa
        );
    }
}
