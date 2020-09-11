import {
    MpXmlParseResult,
    IParseElementAdapter,
    MkValidateMessage,
    MkXmlElement,
    MpXmlElement,
    MpPlatform,
} from "@mpkit/types";
import { parseXML } from "./xml-parser";
import MpAdapter from "./adapter/index";

export const parseMpXml = (
    mpXml: string,
    adapter: MpPlatform | IParseElementAdapter
): MpXmlParseResult => {
    const xmlParseResult = parseXML(mpXml);
    if (xmlParseResult.error) {
        delete xmlParseResult.elements;
        return (xmlParseResult as unknown) as MpXmlParseResult;
    }
    let parseAdapter: IParseElementAdapter;
    if (typeof adapter === "object" && adapter.parse) {
        parseAdapter = adapter;
    } else if (typeof adapter === "string" && MpPlatform[adapter]) {
        parseAdapter = MpAdapter[adapter];
    } else {
        throw new Error("adapter参数有误，无法解析");
        return;
    }
    const eachParse = (
        elements: MkXmlElement[],
        allElements: MkXmlElement[]
    ): MpXmlElement[] => {
        return elements.map((item, index, arr) => {
            let children;
            if (item.children) {
                children = eachParse(item.children, allElements);
            }
            const res = parseAdapter.parse({
                currentElement: item,
                currentElementIndex: index,
                brotherElements: arr,
                allElements,
                orgXml: xmlParseResult.xml,
            });
            if (children && children.length) {
                res.children = children;
            }
            return res;
        });
    };
    try {
        const allElements = xmlParseResult.elements;
        const elements = eachParse(allElements, allElements);
        const result = (xmlParseResult as unknown) as MpXmlParseResult;
        result.elements = elements;
        return result;
    } catch (error) {
        const result = (xmlParseResult as unknown) as MpXmlParseResult;
        delete result.elements;
        result.error = error as MkValidateMessage;
        return result;
    }
};
