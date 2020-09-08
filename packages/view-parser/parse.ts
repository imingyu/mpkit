import {
    MpXmlParseResult,
    IParseElementAdapter,
    MkValidateMessage,
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
    try {
        const elements = xmlParseResult.elements.map((item, index, arr) => {
            return parseAdapter.parse(item, arr, xmlParseResult.xml);
        });
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
