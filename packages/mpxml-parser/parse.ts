import {
    IParseElementAdapter,
    MpPlatform,
    MkXmlParseResult,
    MkXmlNode,
} from "@mpkit/types";
import { FvXmlParser } from "./xml-parser";
import MpAdapter from "./adapter/index";
import { FxNode } from "forgiving-xml-parser";

export const parseMpXml = (
    mpXml: string,
    adapter: MpPlatform | IParseElementAdapter
): MkXmlParseResult => {
    const xmlParseResult = FvXmlParser.parse(mpXml);
    if (xmlParseResult.error) {
        delete xmlParseResult.nodes;
        return (xmlParseResult as unknown) as MkXmlParseResult;
    }
    let parseAdapter: IParseElementAdapter;
    if (typeof adapter === "object" && adapter.parse) {
        parseAdapter = adapter;
    } else if (typeof adapter === "string" && MpPlatform[adapter]) {
        parseAdapter = MpAdapter[adapter];
    } else {
        throw new Error("adapter参数有误，无法解析");
    }
    const eachParse = (
        elements: FxNode[],
        allElements: FxNode[],
        parentElement?: MkXmlNode
    ): MkXmlNode[] => {
        return elements.map((el, index) => {
            const res = parseAdapter.parse({
                currentElement: el,
                currentElementIndex: index,
                brotherElements: elements,
                allElements,
                xml: xmlParseResult.xml,
            });
            if (parentElement) {
                res.parent = parentElement;
            }
            let children;
            if (el.children) {
                children = eachParse(el.children, allElements, res);
            }

            if (children && children.length) {
                res.children = children;
            }
            return res;
        });
    };
    const result = (xmlParseResult as unknown) as MkXmlParseResult;
    try {
        result.nodes = eachParse(xmlParseResult.nodes, xmlParseResult.nodes);
    } catch (error) {
        delete result.nodes;
        // result.error = error as MkValidateMessage;
    }
    return result;
};
