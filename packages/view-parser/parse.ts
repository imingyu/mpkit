import {
    MpXmlParseResult,
    IParseElementAdapter,
    MkValidateMessage,
    MkXmlElement,
    MpXmlElement,
} from "@mpkit/types";
import { parseXML } from "./xml-parser";

export const parseMpXml = (
    mpXml: string,
    parseAdapter: IParseElementAdapter
): MpXmlParseResult => {
    const xmlParseResult = parseXML(mpXml);
    if (xmlParseResult.error) {
        delete xmlParseResult.elements;
        return (xmlParseResult as unknown) as MpXmlParseResult;
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
            res.children = children;
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
