import {
    MkXmlElement,
    MkValidateMessagePosition,
    MpXmlContent,
    MkXmlElementAttr,
    MpXmlElement,
    MpXmlElementAttr,
    MpXmlContentType,
} from "@mpkit/types";
import throwError from "./throw";
import { BRACKET_THAN_TWO, BRACKET_NOT_CLOSE } from "./message";
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
