import {
    MpPlatform,
    IMkMpXmlParseAdapter,
    MkXmlNode,
    MkMpXmlParseOptions,
    MkMpXmlSerializeOptions,
} from "@mpkit/types";
import { parseMpXml, serialize } from "@mpkit/mpxml-parser";
import { createMpTranslateAdapters } from "./mp";

export const mpTranslateAdapters = createMpTranslateAdapters();

export const translateXml = (
    xml: string,
    sourcePlatform: MpPlatform,
    targetPlatform: MpPlatform,
    sourceParseOptions?: MkMpXmlParseOptions,
    targetSerializeOptions?: MkMpXmlSerializeOptions
): string => {
    const sourceParseResult = parseMpXml(
        xml,
        sourcePlatform,
        sourceParseOptions
    );
    if (sourceParseResult.error) {
        throw sourceParseResult.error;
    }
    if (!sourceParseResult.nodes || !sourceParseResult.nodes.length) {
        return "";
    }
    return serialize(
        translateNodes(sourceParseResult.nodes, sourcePlatform, targetPlatform),
        targetSerializeOptions
    );
};

export const translateNode = (
    node: MkXmlNode,
    sourcePlatform: MpPlatform,
    targetPlatform: MpPlatform
): MkXmlNode => {
    const adapter = mpTranslateAdapters.find((item) =>
        item.match(sourcePlatform, targetPlatform)
    );
    if (adapter) {
        return adapter.translater(node);
    }
    return node;
};

export const translateNodes = (
    nodes: MkXmlNode[],
    sourcePlatform: MpPlatform,
    targetPlatform: MpPlatform
): MkXmlNode[] => {
    return nodes.map((item) =>
        translateNode(item, sourcePlatform, targetPlatform)
    );
};
