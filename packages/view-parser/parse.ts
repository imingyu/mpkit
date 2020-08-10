import {
    MpViewParserOptions,
    MpElement,
    MpElementType,
    MpElementContentType,
    MpElementContent,
} from "@mpkit/types";
import { parse as parseXML } from "fast-xml-parser";
import { each } from "lodash";

const hasDynamicExpression = (str: string): boolean => {
    return str.indexOf("{{") >= 0 && str.indexOf("}}") >= 0;
};
const convertAstValueToMpElementValue = (astValue): MpElementContent => {
    if (hasDynamicExpression(astValue)) {
        return {
            type: MpElementContentType.dynamic,
            value: {
                source: astValue,
                ast: null,
            },
        };
    }
};
const convertAstToMpElements = (astObj: any): MpElement[] => {
    const result: MpElement[] = [];
    each(astObj, (value, elTag) => {
        if (elTag === "#text") {
            result.push({
                tag: elTag,
                type: MpElementType.text,
                children: [convertAstValueToMpElementValue(value)],
            });
        } else if (!value) {
            result.push({
                tag: elTag,
                type: MpElementType.node,
                selfCloseing: true,
            });
        } else if (Array.isArray(value)) {
            each(value, (item) => {
                result.push({
                    tag: elTag,
                    type: MpElementType.node,
                    children: convertAstToMpElements(item),
                });
            });
        } else {
            result.push({
                tag: elTag,
                type: MpElementType.node,
                children: convertAstToMpElements(value),
            });
        }
    });
    return result;
};

export default (
    sourceStr: string,
    options?: MpViewParserOptions
): MpElement[] => {
    return convertAstToMpElements(
        parseXML(sourceStr, {
            attributeNamePrefix: "@_",
            ignoreAttributes: false,
            trimValues: false,
            allowBooleanAttributes: true,
        })
    );
};
