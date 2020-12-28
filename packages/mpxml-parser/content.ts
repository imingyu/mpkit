import {
    MkXmlContent,
    MkXmlNode,
    MkXmlNodeJSON,
    MpXmlContentType,
} from "@mpkit/types";
import {
    FxNode,
    FxNodeJSON,
    moveCursor,
    FxCursorPosition,
    toCursor,
    repeatString,
} from "forgiving-xml-parser";
import { cursorToLocation, plusCursor } from "./util";
import throwError from "./throw";
import { BRACKET_NOT_CLOSE, BRACKET_THAN_TWO } from "./message";

export const parseMpXmlContent = (
    content: string,
    node?: FxNode | FxNodeJSON | MkXmlNode | MkXmlNodeJSON,
    leftBracketChar: string = "{",
    rightBracketChar: string = "}",
    bracketCount: number = 2
): MkXmlContent[] => {
    const cursor: FxCursorPosition = {
        lineNumber: 1,
        offset: 0,
        column: 1,
    };
    if (!content) {
        return [
            {
                type: MpXmlContentType.static,
                value: content,
                locationInfo: cursorToLocation(cursor),
            },
        ];
    }
    let contentStartCursor: FxCursorPosition = {
        offset: 0,
        column: 1,
        lineNumber: 1,
    };

    if (node && node.locationInfo.content) {
        contentStartCursor = {
            offset: node.locationInfo.content.startOffset,
            column: node.locationInfo.content.startColumn,
            lineNumber: node.locationInfo.content.startLineNumber,
        };
    }
    const result: MkXmlContent[] = [];
    let text = "";
    let bkCount = 0; // 括号字符数量
    let bkPosition = 0; // 1=左括号，2=右括号
    let staticSartCursor: FxCursorPosition;
    let dyStartCursor: FxCursorPosition;
    const getCursor = () => {
        return plusCursor(cursor, contentStartCursor);
    };
    const reset = () => {
        dyStartCursor = staticSartCursor = undefined;
        bkCount = 0;
        bkPosition = 0;
        text = "";
    };
    const pushStatic = (endCursor?: FxCursorPosition) => {
        result.push({
            type: MpXmlContentType.static,
            value: text,
            locationInfo: cursorToLocation(
                plusCursor(staticSartCursor, contentStartCursor),
                plusCursor(endCursor, contentStartCursor)
            ),
        });
        text = "";
        staticSartCursor = undefined;
    };
    for (
        let len = content.length;
        cursor.offset < len;
        moveCursor(cursor, 0, 1, 1)
    ) {
        const char = content[cursor.offset];
        if (!staticSartCursor) {
            staticSartCursor = {
                ...cursor,
            };
        }
        if (char === leftBracketChar) {
            if (!bkCount) {
                // 之前未遇到括号表达式
                dyStartCursor = {
                    ...cursor,
                };
                bkCount++;
                bkPosition = 1;
                continue;
            }
            if (bkPosition === 1) {
                if (bkCount + 1 <= bracketCount) {
                    bkCount++;
                    continue;
                }
                return throwError({
                    ...BRACKET_THAN_TWO,
                    target: node,
                    ...getCursor(),
                });
            }
            return throwError({
                ...BRACKET_NOT_CLOSE,
                target: node,
                ...getCursor(),
            });
        }
        if (char === rightBracketChar) {
            if (!bkPosition) {
                text += char;
                continue;
            }
            if (bkPosition === 1) {
                text += char;
                bkPosition = 0;
                dyStartCursor = undefined;
                bkCount = 0;
                continue;
            }
            if (bkCount + 1 < bracketCount) {
                bkCount++;
                continue;
            }
            result.push({
                type: MpXmlContentType.dynamic,
                value: text,
                locationInfo: cursorToLocation(
                    plusCursor(dyStartCursor, contentStartCursor),
                    plusCursor(cursor, contentStartCursor)
                ),
            });
            reset();
            continue;
        }
        if (bracketCount === bkCount && bkPosition === 1) {
            if (text) {
                pushStatic(dyStartCursor);
            }
            text += char;
            bkPosition = 2;
            bkCount = 0;
            continue;
        }
        if (bkCount && bkCount < bracketCount) {
            if (bkPosition === 1) {
                bkPosition = 0;
                bkCount = 0;
                dyStartCursor = undefined;
                text += `${repeatString(leftBracketChar, bkCount)}${char}`;
                continue;
            }
            return throwError({
                ...BRACKET_NOT_CLOSE,
                target: node,
                ...getCursor(),
            });
        }
        text += char;
    }
    if (text) {
        pushStatic(cursor);
        reset();
    }
    return result;
};
