import {
    MkMap,
    MpXmlElement,
    MpXmlElementAttr,
    MkXmlElement,
    MkXmlElementType,
    IParseAttrAdapter,
    IParseContentAdapter,
    IParseElementAdapter,
    MpXmlContent,
    MkValidateMessagePosition,
    MkXmlElementAttr,
    MpXmlContentType,
} from "@mpkit/types";
import { nextCharCount, firstAfterCharsIndex } from "@mpkit/util";
import throwError from "../throw";
import { BRACKET_THAN_TWO, BRACKET_NOT_CLOSE } from "../message";

export abstract class ParseElementAdapterImpl implements IParseElementAdapter {
    attrAdapters: MkMap<IParseAttrAdapter>;
    contentAdapter: IParseContentAdapter;
    constructor(
        attrAdapters: MkMap<IParseAttrAdapter>,
        contentAdapter: IParseContentAdapter
    ) {
        this.attrAdapters = attrAdapters;
        this.contentAdapter = contentAdapter;
    }
    parse(
        currentElement: MkXmlElement,
        allElements: MkXmlElement[],
        orgXml: string
    ): MpXmlElement {
        if (currentElement.type === MkXmlElementType.node) {
            let attrs;
            if (currentElement.attrs) {
                const commonAttr = this.attrAdapters["*"];
                attrs = currentElement.attrs.map((item, index, arr) => {
                    let resultAttr: MpXmlElementAttr;
                    const currentAttr = this.attrAdapters[item.name];
                    if (currentAttr) {
                        resultAttr = currentAttr.parse(
                            currentElement,
                            allElements,
                            orgXml,
                            item,
                            arr
                        );
                    }
                    if (commonAttr) {
                        resultAttr = commonAttr.parse(
                            currentElement,
                            allElements,
                            orgXml,
                            item,
                            arr,
                            resultAttr
                        );
                    }
                    if (!resultAttr) {
                        resultAttr = (item as unknown) as MpXmlElementAttr;
                        if (item.content && item.content.trim()) {
                            resultAttr.content = this.contentAdapter.parse(
                                item.content
                            );
                        }
                    }

                    return resultAttr;
                });
            }
            const result = (currentElement as unknown) as MpXmlElement;
            if (attrs) {
                result.attrs = attrs;
            }
            return result;
        }
        if (
            currentElement.type === MkXmlElementType.text &&
            currentElement.content &&
            currentElement.content.trim()
        ) {
            const content = this.contentAdapter.parse(currentElement.content);
            const result = (currentElement as unknown) as MpXmlElement;
            result.content = content;
            return result;
        }
        return (currentElement as unknown) as MpXmlElement;
    }
}

export abstract class ParseContentAdapterImpl implements IParseContentAdapter {
    parse(content: string): MpXmlContent[] {
        return ParseContentAdapterImpl.validate(content);
    }
    static validate(
        content: string,
        target?:
            | MkXmlElement
            | MkXmlElementAttr
            | MpXmlContent
            | MpXmlElement
            | MpXmlElementAttr
    ): MpXmlContent[] {
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
                        position: MkValidateMessagePosition.content,
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
                            position: MkValidateMessagePosition.content,
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
        return result;
    }
}
