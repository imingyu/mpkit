import { LikeFxParseContext, MkXmlNode } from "@mpkit/types";
import {
    FxCursorPosition,
    FxNodeJSON,
    FxLocation,
    FxNode,
    FxParseContext,
    FxNodeType,
} from "forgiving-xml-parser";
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

export const getParent = (
    node: FxNode,
    context: FxParseContext
): FxNode | LikeFxParseContext => {
    if (node.parent) {
        return node.parent;
    }
    if (context.nodes.indexOf(node) !== -1) {
        return context;
    }
};
export const getPreviousSibling = (
    node: FxNodeJSON,
    parent: FxNodeJSON | LikeFxParseContext
): FxNodeJSON => {
    const children =
        node.type === FxNodeType.attr
            ? (parent as FxNodeJSON).attrs
            : "type" in parent
            ? (parent as FxNodeJSON).children
            : ((parent as LikeFxParseContext).nodes as FxNodeJSON[]);
    let nodeIndex = children.indexOf(node);
    if (nodeIndex > 0) {
        let prev: FxNodeJSON;
        while (nodeIndex--) {
            if (
                children[nodeIndex].type !== FxNodeType.text &&
                children[nodeIndex].type !== FxNodeType.comment
            ) {
                prev = children[nodeIndex];
                break;
            }
        }
        return prev;
    }
};
