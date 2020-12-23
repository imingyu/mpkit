import {
    MkXmlContent,
    MkXmlContentParseResult,
    MkXmlParseMessagePosition,
    MpXmlContentType,
} from "@mpkit/types";
import throwError from "./throw";
import { BRACKET_THAN_TWO, BRACKET_NOT_CLOSE } from "./message";
import { nextCharCount } from "@mpkit/util";
import {
    currentIsLineBreak,
    FxCursorPosition,
    FxEventType,
    FxNode,
    FxTryStep,
    moveCursor,
    toCursor,
    findStrCursor,
    FxNodeJSON,
} from "forgiving-xml-parser";
export const hasAttr = (element: FxNodeJSON, attrName: string): boolean => {
    return (
        element.attrs && element.attrs.some((attr) => attr.name === attrName)
    );
};

export const attrIsEmpty = (attrContent: string): boolean =>
    !attrContent || !attrContent.trim();

export const parseContent = (
    content: string,
    position?: MkXmlParseMessagePosition,
    target?: FxNode | FxNodeJSON,
    parent?: FxNode | FxNodeJSON,
    grandpa?: FxNode | FxNodeJSON
): MkXmlContentParseResult => {
    const result: MkXmlContent[] = [];
    const leftStaticContents: MkXmlContent[] = [];
    const rightStaticContents: MkXmlContent[] = [];
    const betweenStaticContents: MkXmlContent[] = [];
    const dynamicContents: MkXmlContent[] = [];
    let leftStaticContentsIsEmpty = true;
    let rightStaticContentsHasChar = false;
    let firstDynamic: MkXmlContent;
    let lastStatic: MkXmlContent;
    let text = "";
    let cursor: FxCursorPosition = {
        offset: 0,
        column: 1,
        lineNumber: 1,
    };
    let contentStartCursor: FxCursorPosition = {
        offset: 0,
        column: 1,
        lineNumber: 1,
    };

    if (target && target.locationInfo.content) {
        contentStartCursor = {
            offset: target.locationInfo.content.startOffset,
            column: target.locationInfo.content.startColumn,
            lineNumber: target.locationInfo.content.startLineNumber,
        };
    }
    const getCursor = (cr?: FxCursorPosition) => {
        if (!target) {
            return cr || cursor;
        }
        cr = cr || cursor;
        return moveCursor(
            toCursor(contentStartCursor),
            cr.lineNumber - 1,
            cr.column,
            cr.offset
        );
    };

    const addStaticContent = () => {
        const item = {
            type: MpXmlContentType.static,
            value: text,
            locationInfo: {
                startColumn: startCursor.column,
                startOffset: startCursor.offset,
                startLineNumber: startCursor.lineNumber,
                endColumn: endCursor.column,
                endLineNumber: endCursor.lineNumber,
                endOffset: endCursor.offset,
            },
        };
        if (!firstDynamic) {
            leftStaticContents.push(item);
            leftStaticContentsIsEmpty =
                leftStaticContentsIsEmpty && !item.value.trim();
        } else {
            lastStatic = item;
            rightStaticContents.push(item);
            rightStaticContentsHasChar = !!item.value.trim();
        }
        result.push(item);
        text = "";
        startCursor = endCursor = undefined;
    };

    const addDynamicContent = (
        value: string,
        beginCursor: FxCursorPosition,
        endCursor: FxCursorPosition
    ) => {
        const dynamicContent = {
            type: MpXmlContentType.dynamic,
            value: value,
            locationInfo: {
                startColumn: beginCursor.column,
                startOffset: beginCursor.offset,
                startLineNumber: beginCursor.lineNumber,
                endColumn: endCursor.column,
                endLineNumber: endCursor.lineNumber,
                endOffset: endCursor.offset,
            },
        };
        if (!firstDynamic) {
            firstDynamic = dynamicContent;
        } else if (lastStatic) {
            betweenStaticContents.push(rightStaticContents.pop());
            rightStaticContentsHasChar = false;
        }
        result.push(dynamicContent);
    };

    let startCursor: FxCursorPosition;
    let endCursor: FxCursorPosition;
    const setStartCursor = (cursor: FxCursorPosition) => {
        if (!startCursor) {
            startCursor = {
                ...cursor,
            };
        }
    };

    for (
        const len = content.length;
        cursor.offset < len;
        moveCursor(cursor, 0, 1, 1)
    ) {
        setStartCursor(cursor);

        let i = cursor.offset;
        const char = content[i];
        if (char === "{") {
            const nextCount = nextCharCount(char, i, content);
            if (nextCount > 1) {
                // 存在"{{{"语法错误
                return throwError({
                    ...BRACKET_THAN_TWO,
                    target,
                    position,
                    ...getCursor(),
                });
            } else if (nextCount < 1) {
                // 不构成表达式，直接或略
                text += char;
            } else {
                // 寻找与之对应的"}}"
                moveCursor(cursor, 0, 2, 2);
                const bracketRightCursor = findStrCursor(content, cursor, "}}");
                if (!bracketRightCursor[0]) {
                    // 未找到"}}"
                    return throwError({
                        ...BRACKET_NOT_CLOSE,
                        target,
                        position,
                        ...getCursor(startCursor),
                    });
                }
                const bracketContent = content.substring(
                    cursor.offset,
                    bracketRightCursor[2].offset
                );
                if (text) {
                    addStaticContent();
                }
                addDynamicContent(
                    bracketContent,
                    cursor,
                    bracketRightCursor[2]
                );
                Object.assign(cursor, bracketRightCursor[2]);
            }
            continue;
        }
        text += char;
        const brType = currentIsLineBreak(content, cursor.offset);
        if (brType != -1) {
            moveCursor(cursor, 1, -cursor.column + 1, !brType ? 0 : 1);
        } else {
            moveCursor(cursor, 0, 1, 1);
        }
        endCursor = {
            ...cursor,
        };
    }
    if (text) {
        addStaticContent();
    }
    return {
        contents: result,
        leftStaticContents,
        leftStaticContentsIsEmpty,
        rightStaticContents,
        rightStaticContentsIsEmpty: !rightStaticContentsHasChar,
        betweenStaticContents,
        dynamicContents,
    };
};

export const getXmlFrament = (
    xmlRows: string[],
    startLine: number,
    framentOffset = 2
): string => {
    startLine = startLine - 1;
    return (
        ">>> " +
        xmlRows
            .slice(
                startLine,
                startLine + framentOffset > xmlRows.length
                    ? xmlRows.length
                    : startLine + framentOffset
            )
            .join("\n")
    );
};
