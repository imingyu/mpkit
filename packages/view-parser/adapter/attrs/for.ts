import {
    IMpParseAttrAdapter,
    MpPlatform,
    MkXmlElement,
    MkXmlElementAttr,
    MpXmlElementAttr,
    ParseAttrAdapterArg,
    MkValidateMessagePosition,
} from "@mpkit/types";
import MpSpec from "../../spec";
// 处理循环语句
export class ParseForAttrAdapter implements IMpParseAttrAdapter {
    mpPlatform: MpPlatform;
    mpViewSyntax: MpViewSyntaxSpec;
    constructor(mpPlatform: MpPlatform) {
        this.mpPlatform = mpPlatform;
        const spec = MpSpec.ViewSyntax[this.mpPlatform];
    }
    parse(data: ParseAttrAdapterArg): MpXmlElementAttr {}
}
