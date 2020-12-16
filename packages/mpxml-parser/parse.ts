import {
    MpPlatform,
    MkXmlParseResult,
    MkXmlNode,
    IMkMpXmlParseAdapter,
} from "@mpkit/types";
import MpAdapter from "./adapter/index";
import {
    parse as parseXML,
    FxNode,
    FxEventType,
    FxParseContext,
    FxWrong,
    FxNodeType,
} from "forgiving-xml-parser";
import { PARSE_PARAMS_WRONG } from "./message";
import { isEmptyObject } from "@mpkit/util";
export const parseMpXml = (
    mpXml: string,
    adapter: MpPlatform | IMkMpXmlParseAdapter
): MkXmlParseResult => {
    let parseAdapter: IMkMpXmlParseAdapter;
    const tpAdapter = typeof adapter;
    if (adapter && tpAdapter === "object") {
        parseAdapter = adapter as IMkMpXmlParseAdapter;
    } else if (tpAdapter === "string" && MpPlatform[adapter as string]) {
        parseAdapter = MpAdapter[adapter as MpPlatform];
    } else {
        return {
            error: {
                ...PARSE_PARAMS_WRONG,
                offset: -1,
                lineNumber: -1,
                column: -1,
            },
            maxLine: -1,
            maxCol: -1,
            xml: mpXml,
        };
    }
    const hasAttrAdapter = !isEmptyObject(parseAdapter.attrAdapters);
    const xmlParseResult = parseXML(mpXml, {
        allowNodeNameEmpty: false,
        allowAttrContentHasBr: false,
        allowEndTagBoundaryNearSpace: false,
        allowNodeNotClose: false,
        allowStartTagBoundaryNearSpace: false,
        allowTagNameHasSpace: false,
        ignoreTagNameCaseEqual: false,
        onEvent(
            type: FxEventType,
            context: FxParseContext,
            data: FxNode | FxWrong
        ) {
            if (type === FxEventType.attrsEnd && hasAttrAdapter) {
                const eventNode = data as FxNode;
                if (eventNode.attrs && eventNode.attrs.length) {
                    eventNode.attrs = eventNode.attrs.map(
                        (attr, inde, attrs) => {
                            if (parseAdapter[attr.name]) {
                                return parseAdapter.attrAdapters[
                                    attr.name
                                ].parse(attr);
                            }
                            if (parseAdapter.attrAdapters.__unclaimed) {
                                return parseAdapter.attrAdapters.__unclaimed.parse(
                                    attr
                                );
                            }
                            return attr;
                        }
                    );
                }
                return;
            }
            if (
                type === FxEventType.nodeEnd &&
                data &&
                (data as FxNode).type === FxNodeType.text &&
                parseAdapter.contentAdapter
            ) {
                const eventNode = data as MkXmlNode;
                eventNode.mpContents = parseAdapter.contentAdapter.parse(
                    eventNode.content,
                    eventNode
                );
                return;
            }
        },
    });
    if (xmlParseResult.error) {
        delete xmlParseResult.nodes;
    }
    return (xmlParseResult as unknown) as MkXmlParseResult;
};
