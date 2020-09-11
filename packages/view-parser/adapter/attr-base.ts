import {
    MpPlatform,
    ParseAttrAdapterArg,
    MpViewSyntaxSpec,
    MkValidateMessagePosition,
    MpXmlContentType,
    MpXmlContent,
} from "@mpkit/types";
import MpSpec from "../spec";
import { validateContent } from "../util";
import throwError from "../throw";
import { ATTR_CONTENT_HAS_MORE_VAR } from "@mpkit/view-parser/message";

export default class MpBaseParseAttrAdapter {
    mpPlatform: MpPlatform;
    mpViewSyntax: MpViewSyntaxSpec;
    constructor(mpPlatform: MpPlatform) {
        this.mpPlatform = mpPlatform;
        const spec = MpSpec.ViewSyntax[this.mpPlatform];
        this.mpViewSyntax = spec;
    }
    parseContent(data: ParseAttrAdapterArg): MpXmlContent[] {
        const { currentAttr } = data;
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
        return contents;
    }
}
