import {
    MpPlatform,
    ParseAttrAdapterArg,
    MpViewSyntaxSpec,
    MkValidateMessagePosition,
    MpXmlContentType,
    MpXmlContent,
    MpXmlElementAttr,
} from "@mpkit/types";
import MpSpec from "../spec";
import { parseContent } from "../util";
import throwError from "../throw";
import { ATTR_CONTENT_HAS_MORE_VAR } from "../message";

export default class MpBaseParseAttrAdapter {
    mpPlatform: MpPlatform;
    mpViewSyntax: MpViewSyntaxSpec;
    allowMoreContentVar: boolean = true;
    constructor(mpPlatform: MpPlatform) {
        this.mpPlatform = mpPlatform;
        const spec = MpSpec.ViewSyntax[this.mpPlatform];
        this.mpViewSyntax = spec;
    }
    parse(data: ParseAttrAdapterArg): MpXmlElementAttr {
        const attr = (data.currentAttr as unknown) as MpXmlElementAttr;
        const content = this.parseContent(data);
        if (Array.isArray(content)) {
            attr.content = content;
        }
        return attr;
    }
    parseContent(data: ParseAttrAdapterArg): MpXmlContent[] {
        const { currentAttr } = data;
        if ("content" in currentAttr) {
            if (this.mpViewSyntax.forAndWhereAttrNeedBracket) {
                const contents = parseContent(
                    currentAttr.content,
                    MkValidateMessagePosition.attr,
                    currentAttr
                );
                if (!this.allowMoreContentVar) {
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
                    return filterEmpty;
                }
                return contents;
            }
            return [
                {
                    type: MpXmlContentType.dynamic,
                    value: currentAttr.content,
                },
            ];
        }
    }
}
