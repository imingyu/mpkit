import { parseFragment } from "parse5";
import { TAG_NOT_CLOSE, TAG_HAS_SPACE } from "./message";
import {
    MkXmlElement,
    MkXmlElementType,
    MkXmlValidateResult,
    MkXmlParseResult,
    MkValidateMessage,
    MkValidateMessagePosition,
    MkXmlElementAttr,
} from "@mpkit/types";
import throwError from "./throw";
const getElementType = (node): MkXmlElementType => {
    if (node.nodeName === "#text") {
        return MkXmlElementType.text;
    }
    if (node.nodeName === "#comment") {
        return MkXmlElementType.comment;
    }
    return MkXmlElementType.node;
};

const getXmlFrament = (
    xmlRows: string[],
    startLine: number,
    framentOffset = 2
): string => {
    return (
        ">>> " +
        xmlRows
            .slice(
                startLine,
                startLine + framentOffset > xmlRows.length - 1
                    ? xmlRows.length - 1
                    : startLine + framentOffset
            )
            .join("\n")
    );
};

const validateSelfCloseing = (
    xml: string,
    xmlRows: string[],
    node,
    nextNode,
    element: MkXmlElement
): void | MkValidateMessage => {
    const {
        startOffset,
        endOffset,
        startLine,
        startCol,
    } = node.sourceCodeLocation.startTag;
    if (node.tagName === "image") {
        if (
            nextNode &&
            nextNode.sourceCodeLocation.startOffset >
                node.sourceCodeLocation.endOffset
        ) {
            return;
        }
    }

    let tagHead = xml.substring(startOffset, endOffset);
    if (tagHead.endsWith("/>")) {
        return;
    }

    return {
        message: TAG_NOT_CLOSE,
        position: MkValidateMessagePosition.tag,
        target: element,
        fragment: getXmlFrament(xmlRows, startLine),
    };
};

// const correctTagHead = (orgTagHead: string): string => {
//     let res = "";
//     let emptyChars = "";
//     for (let i = 1, len = orgTagHead.length; i < len; i++) {
//         if (orgTagHead[i].trim()) {
//             break;
//         }
//         emptyChars += orgTagHead[i];
//     }
//     res = orgTagHead.replace(`<${emptyChars}`, "<");
//     emptyChars = "";
//     if (orgTagHead[orgTagHead.length - 1] === ">") {
//         for (let i = orgTagHead.length - 2; i >= 0; i--) {
//             if (orgTagHead[i].trim()) {
//                 break;
//             }
//             emptyChars += orgTagHead[i];
//         }
//         if (emptyChars) {
//             res = res.replace(`${emptyChars}>`, ">");
//         }
//     }
//     return res;
// };

const eachChildren = (
    xml: string,
    xmlRows: string[],
    children: any[],
    elements: MkXmlElement[],
    parseResult: MkXmlValidateResult
) => {
    children.forEach((childNode, nodeIndex) => {
        const {
            startTag,
            endTag,
            startLine,
            startCol,
            startOffset,
            endOffset,
        } = childNode.sourceCodeLocation;
        const xmlElement: MkXmlElement = {
            type: getElementType(childNode),
            sourceLocationInfo: childNode.sourceCodeLocation,
        };
        if (xmlElement.type === MkXmlElementType.text) {
            if (
                childNode.value.indexOf("< ") !== -1 ||
                childNode.value.indexOf(" >") !== -1
            ) {
                // const orgTagHead = childNode.value.trim();
                // let tagHead = correctTagHead(orgTagHead);
                // parseResult.correctXML = xml.replace(orgTagHead, tagHead);
                return throwError({
                    message: TAG_HAS_SPACE,
                    position: MkValidateMessagePosition.tag,
                    target: xmlElement,
                    fragment: getXmlFrament(xmlRows, startLine),
                });
            }
            xmlElement.content = childNode.value;
            elements.push(xmlElement);
            return;
        }
        if (xmlElement.type === MkXmlElementType.comment) {
            xmlElement.content = childNode.data;
            elements.push(xmlElement);
            return;
        }
        if (xmlElement.type === MkXmlElementType.node) {
            if (childNode.tagName === "img") {
                const nodeXML = xml.substring(startOffset, endOffset);
                if (nodeXML.indexOf("<image") === 0) {
                    childNode.tagName = "image";
                }
            }
            xmlElement.tag = childNode.tagName;
            if (childNode.attrs && childNode.attrs.length) {
                xmlElement.attrs = [];
                childNode.attrs.forEach((attr) => {
                    xmlElement.attrs.push({
                        name: attr.name,
                        content: attr.value,
                        sourceLocationInfo:
                            childNode.sourceCodeLocation.attrs[attr.name],
                    });
                });
            }
            if (startTag && !endTag) {
                const res = validateSelfCloseing(
                    xml,
                    xmlRows,
                    childNode,
                    children[nodeIndex + 1],
                    xmlElement
                );
                if (res) {
                    return throwError(res);
                }
                xmlElement.selfCloseing = true;
                elements.push(xmlElement);
                return eachChildren(
                    xml,
                    xmlRows,
                    childNode.childNodes,
                    elements,
                    parseResult
                );
            } else if (childNode.childNodes && childNode.childNodes.length) {
                xmlElement.children = [];
                elements.push(xmlElement);
                return eachChildren(
                    xml,
                    xmlRows,
                    childNode.childNodes,
                    xmlElement.children,
                    parseResult
                );
            } else {
                return elements.push(xmlElement);
            }
        }
    });
};
export const validateXML = (xml: string): MkXmlValidateResult => {
    xml = xml.trim();
    const result = {
        elements: [],
    } as MkXmlValidateResult;
    const fragmentJSON = parseFragment(xml, {
        sourceCodeLocationInfo: true,
    });
    try {
        eachChildren(
            xml,
            xml.split("\n"),
            fragmentJSON.childNodes,
            result.elements,
            result
        );
    } catch (error) {
        result.error = error.data;
    }
    return result;
};
export const parseXML = (xml: string): MkXmlParseResult => {
    const validateResult = validateXML(xml);
    if (validateResult.error) {
        return validateResult;
    }
    return validateResult;
};
