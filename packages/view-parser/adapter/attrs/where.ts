import {
    IMpParseAttrAdapter,
    MpPlatform,
    MpXmlElementAttr,
    ParseAttrAdapterArg,
    MpViewSyntaxSpec,
} from "@mpkit/types";
import MpSpec from "../../spec";
import { validateForAndWhereAttr } from "../../util";

// 处理条件语句
export class ParseWehreAttrAdapter implements IMpParseAttrAdapter {
    mpPlatform: MpPlatform;
    mpViewSyntax: MpViewSyntaxSpec;
    ifValue: string;
    elseifValue: string;
    elseValue: string;
    constructor(mpPlatform: MpPlatform) {
        this.mpPlatform = mpPlatform;
        const spec = MpSpec.ViewSyntax[this.mpPlatform];
        this.mpViewSyntax = spec;
        this.ifValue = spec.namespace + spec.if;
        this.elseifValue = spec.namespace + spec.elseif;
        this.elseValue = spec.namespace + spec.else;
    }
    parse(data: ParseAttrAdapterArg): MpXmlElementAttr {
        const attr = (data.currentAttr as unknown) as MpXmlElementAttr;
        const attrContent = validateForAndWhereAttr(this, data);
        if (attrContent) {
            attr.content = attrContent;
        }
        return attr;
    }
}
