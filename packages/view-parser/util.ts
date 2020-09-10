import {
    MkXmlElement,
    ParseAttrAdapterArg,
    MkValidateMessagePosition,
    MpXmlContent,
    MkXmlElementAttr,
    MpXmlElement,
    MpXmlElementAttr,
    MpXmlContentType,
} from "@mpkit/types";
import { ParseWehreAttrAdapter } from "./adapter/attrs/where";
import { ParseForAttrAdapter } from "./adapter/attrs/for";
import throwError from "./throw";
import {
    ATTR_WHERE_NOT_IF,
    BRACKET_THAN_TWO,
    BRACKET_NOT_CLOSE,
    ATTR_CONTENT_HAS_MORE_VAR,
} from "./message";
import { nextCharCount } from "@mpkit/util";
import { firstAfterCharsIndex } from "@mpkit/util";
export const hasAttr = (element: MkXmlElement, attrName: string): boolean => {
    return (
        element.attrs && element.attrs.some((attr) => attr.name === attrName)
    );
};

export const attrIsEmpty = (attrContent: string): boolean =>
    !attrContent || !attrContent.trim();

export const validateContent = (
    content: string,
    position?: MkValidateMessagePosition,
    target?:
        | MkXmlElement
        | MkXmlElementAttr
        | MpXmlContent
        | MpXmlElement
        | MpXmlElementAttr
): MpXmlContent[] => {
    const result: MpXmlContent[] = [];
    let text = "";
    for (let i = 0, len = content.length; i < len; i++) {
        const char = content[i];
        if (char === "{") {
            const nextCount = nextCharCount(char, i, content);
            if (nextCount > 1) {
                // 存在"{{{"语法错误
                return throwError({
                    message: BRACKET_THAN_TWO,
                    target,
                    position,
                });
            } else if (nextCount < 1) {
                // 不构成表达式，直接或略
                text += content.substr(i, nextCount + 1);
                i += nextCount;
            } else {
                // 寻找与之对应的"}}"
                const bracketRightIndex = firstAfterCharsIndex(
                    i + 1,
                    "}}",
                    content
                );
                if (bracketRightIndex === -1) {
                    // 未找到"}}"
                    return throwError({
                        message: BRACKET_NOT_CLOSE,
                        target,
                        position,
                    });
                }
                const bracketContent = content.substring(
                    i + 2,
                    bracketRightIndex
                );
                if (text) {
                    result.push({
                        type: MpXmlContentType.static,
                        value: text,
                    });
                    text = "";
                }
                result.push({
                    type: MpXmlContentType.dynamic,
                    value: bracketContent,
                });
                i = bracketRightIndex + 2;
            }
        } else {
            text += char;
        }
    }
    if (text) {
        result.push({
            type: MpXmlContentType.static,
            value: text,
        });
        text = "";
    }
    if (!result.length) {
        result.push({
            type: MpXmlContentType.static,
            value: "",
        });
    }
    return result;
};

export const validateForAndWhereAttr = (
    attrAdapter: ParseWehreAttrAdapter | ParseForAttrAdapter,
    data: ParseAttrAdapterArg
): MpXmlContent[] => {
    const { currentAttr, currentElementIndex, brotherElements } = data;
    const attrName = currentAttr.name;
    if (attrAdapter instanceof ParseWehreAttrAdapter) {
        if (attrName === attrAdapter.elseifValue) {
            const brotherElement = brotherElements[currentElementIndex - 1];
            if (
                !brotherElement ||
                !hasAttr(brotherElement, attrAdapter.ifValue)
            ) {
                return throwError({
                    message: ATTR_WHERE_NOT_IF,
                    position: MkValidateMessagePosition.attr,
                    target: currentAttr,
                });
            }
        }
        if (attrName === attrAdapter.elseValue) {
            const brotherElement = brotherElements[currentElementIndex - 1];
            if (
                !brotherElement ||
                (!hasAttr(brotherElement, attrAdapter.ifValue) &&
                    !hasAttr(brotherElement, attrAdapter.elseifValue))
            ) {
                return throwError({
                    message: ATTR_WHERE_NOT_IF,
                    position: MkValidateMessagePosition.attr,
                    target: currentAttr,
                });
            }
        }
    }
    if (attrAdapter instanceof ParseForAttrAdapter) {
    }
    if (attrAdapter.mpViewSyntax.forAndWhereAttrNeedBracket) {
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
    return [
        {
            type: MpXmlContentType.static,
            value: currentAttr.content,
        },
    ];
};
