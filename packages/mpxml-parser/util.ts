import { FxCursorPosition, FxNodeJSON, FxLocation } from "forgiving-xml-parser";
export const hasAttr = (element: FxNodeJSON, attrName: string): boolean => {
    return (
        element.attrs && element.attrs.some((attr) => attr.name === attrName)
    );
};

export const attrIsEmpty = (attrContent: string): boolean =>
    !attrContent || !attrContent.trim();

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

export const cursorToLocation = (
    cursor: FxCursorPosition,
    endCursor?: FxCursorPosition
): FxLocation => {
    return {
        startColumn: cursor.column,
        startLineNumber: cursor.lineNumber,
        startOffset: cursor.offset,
        endColumn: (endCursor || cursor).column,
        endLineNumber: (endCursor || cursor).lineNumber,
        endOffset: (endCursor || cursor).offset,
    };
};

export const plusCursor = (
    plus: FxCursorPosition,
    startCursor?: FxCursorPosition
): FxCursorPosition => {
    if (!startCursor) {
        return plus;
    }
    return {
        lineNumber:
            plus.lineNumber > 1
                ? startCursor.lineNumber + (plus.lineNumber - 1)
                : startCursor.lineNumber,
        offset: startCursor.offset + plus.offset,
        column: startCursor.column + plus.column,
    };
};
