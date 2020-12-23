import {
    MpPlatform,
    MkXmlParseResult,
    MkXmlNode,
    IMkMpXmlParseAdapter,
    MkMpXmlParseAdapterFormater,
    MkXmlParseResultBase,
    IMkMpXmlAttrParseAdapter,
    MkMpXmlParseOptions,
    MkMap,
} from "@mpkit/types";
import { MpPlatformAdapters } from "./adapter/index";
import {
    parse as parseXML,
    FxNode,
    FxEventType,
    FxParseContext,
    FxWrong,
    FxNodeJSON,
} from "forgiving-xml-parser";
import { ADAPTER_PARAMS_WRONG, XMLJSON_PARAMS_WRONG } from "./message";
import { isEmptyObject } from "@mpkit/util";
import { isFunc } from "@mpkit/util";
const DEFAULT_XML_PARSE_OPTIONS = {
    allowNodeNameEmpty: false,
    allowAttrContentHasBr: false,
    allowEndTagBoundaryNearSpace: false,
    allowNodeNotClose: false,
    allowStartTagBoundaryNearSpace: false,
    allowTagNameHasSpace: false,
    ignoreTagNameCaseEqual: false,
};
const formatAdapter = (
    adapter: MpPlatform | IMkMpXmlParseAdapter
): MkMpXmlParseAdapterFormater => {
    let parseAdapter: IMkMpXmlParseAdapter;
    const tpAdapter = typeof adapter;
    if (adapter && tpAdapter === "object") {
        parseAdapter = adapter as IMkMpXmlParseAdapter;
    } else if (tpAdapter === "string" && MpPlatform[adapter as string]) {
        parseAdapter = MpPlatformAdapters[adapter as MpPlatform];
    }
    return {
        parseAdapter,
        hasAttrAdapter:
            parseAdapter &&
            !isEmptyObject(parseAdapter.attrAdapters) &&
            isFunc(parseAdapter.attrAdapters.parse),
        hasContentAdapter:
            parseAdapter &&
            !isEmptyObject(parseAdapter.contentAdapter) &&
            isFunc(parseAdapter.contentAdapter.parse),
    } as MkMpXmlParseAdapterFormater;
};
const mergeParseOptions = (
    options?: MkMpXmlParseOptions
): MkMpXmlParseOptions => {
    return Object.assign({}, DEFAULT_XML_PARSE_OPTIONS, options || {});
};
const parseFxAttrs = (
    attrAdapters: MkMap<IMkMpXmlAttrParseAdapter>,
    attrs: FxNodeJSON[],
    attrParent?: FxNodeJSON,
    attrGrandpa?: FxNodeJSON
): MkXmlNode[] => {
    return attrs.map((attr, index, attrs) => {
        const attrAdapter = attrAdapters[attr.name] || attrAdapters.__unclaimed;
        if (attrAdapter) {
            return attrAdapter.parse(attr, attrParent, attrGrandpa);
        }
        return attr;
    });
};
const loopParseMpXmlJSON = (
    parseAdapter: IMkMpXmlParseAdapter,
    hasAttrAdapter: boolean,
    hasContentAdapter: boolean,
    nodes: FxNodeJSON[],
    parent?: FxNodeJSON,
    grandpa?: FxNodeJSON
): MkXmlNode[] => {
    return nodes.map((node) => {
        if (hasAttrAdapter && node.attrs && node.attrs.length) {
            node.attrs = parseFxAttrs(
                parseAdapter.attrAdapters,
                node.attrs,
                node,
                parent
            ) as FxNode[];
        }
        if (node.content && hasContentAdapter) {
            const tsNode = node as MkXmlNode;
            tsNode.mpContents = parseAdapter.contentAdapter.parse(
                node.content,
                tsNode,
                parent,
                grandpa
            );
        }
        if (node.children && node.children.length) {
            grandpa = parent;
            parent = node;
            node.children = loopParseMpXmlJSON(
                parseAdapter,
                hasContentAdapter,
                hasAttrAdapter,
                node.children,
                parent,
                grandpa
            );
        }
        return node;
    });
};
export const parseMpXmlJSON = (
    xmlJSON: FxNodeJSON | FxNodeJSON[],
    adapter: MpPlatform | IMkMpXmlParseAdapter = MpPlatform.wechat
): MkXmlParseResultBase => {
    const { parseAdapter, hasContentAdapter, hasAttrAdapter } = formatAdapter(
        adapter
    );
    let wrong;
    if (!parseAdapter) {
        wrong = ADAPTER_PARAMS_WRONG;
    }
    let nodes = Array.isArray(xmlJSON) ? xmlJSON : xmlJSON ? [xmlJSON] : null;

    if (!nodes || nodes.length) {
        wrong = XMLJSON_PARAMS_WRONG;
    }
    if (wrong) {
        return {
            error: {
                ...ADAPTER_PARAMS_WRONG,
                offset: -1,
                lineNumber: -1,
                column: -1,
            },
        };
    }
    try {
        nodes = loopParseMpXmlJSON(
            parseAdapter,
            hasContentAdapter,
            hasAttrAdapter,
            nodes
        );
        return {
            nodes,
        };
    } catch (error) {
        return {
            error,
        };
    }
};
export const parseMpXml = (
    mpXml: string,
    adapter: MpPlatform | IMkMpXmlParseAdapter = MpPlatform.wechat,
    options?: MkMpXmlParseOptions
): MkXmlParseResult => {
    const { parseAdapter, hasAttrAdapter, hasContentAdapter } = formatAdapter(
        adapter
    );
    if (!parseAdapter) {
        return {
            error: {
                ...ADAPTER_PARAMS_WRONG,
                offset: -1,
                lineNumber: -1,
                column: -1,
            },
            maxLine: -1,
            maxCol: -1,
            xml: mpXml,
        };
    }
    const onEvent = options && options.onEvent;
    options = mergeParseOptions(options);
    options.onEvent = function (
        type: FxEventType,
        context: FxParseContext,
        data: FxNode | FxWrong
    ) {
        let previousSibling: FxNode;
        if (type === FxEventType.nodeEnd && data) {
            const eventNode = data as FxNode;
            if (eventNode.parent) {
                const index = eventNode.parent.children.findIndex(
                    (item) => item === eventNode
                );
                if (index > 0) {
                    const prev = eventNode.parent.children[
                        index - 1
                    ] as MkXmlNode;
                    prev.nextSibling = eventNode;
                    (eventNode as MkXmlNode).previousSibling = prev;
                    previousSibling = prev as FxNode;
                }
            }
        }
        if (type === FxEventType.attrsEnd && hasAttrAdapter) {
            const eventNode = data as FxNode;
            if (eventNode.attrs && eventNode.attrs.length) {
                eventNode.attrs = parseFxAttrs(
                    parseAdapter.attrAdapters,
                    eventNode.attrs,
                    eventNode,
                    eventNode.parent
                ) as FxNode[];
            }
        }
        if (
            type === FxEventType.nodeEnd &&
            data &&
            (data as FxNode).content &&
            hasContentAdapter
        ) {
            const eventNode = data as MkXmlNode;
            eventNode.mpContents = parseAdapter.contentAdapter.parse(
                eventNode.content,
                eventNode,
                eventNode.parent,
                eventNode.parent ? eventNode.parent.parent : undefined
            );
        }
        if (type === FxEventType.nodeEnd && previousSibling) {
            if (previousSibling.attrs && previousSibling.attrs.length) {
                previousSibling.attrs = parseFxAttrs(
                    parseAdapter.attrAdapters,
                    previousSibling.attrs,
                    previousSibling,
                    previousSibling.parent
                ) as FxNode[];
            }
            if (previousSibling.content && hasContentAdapter) {
                const eventNode = previousSibling as MkXmlNode;
                eventNode.mpContents = parseAdapter.contentAdapter.parse(
                    eventNode.content,
                    eventNode,
                    eventNode.parent,
                    eventNode.parent ? eventNode.parent.parent : undefined
                );
            }
        }
        onEvent && onEvent.apply(options, arguments);
    };
    const xmlParseResult = parseXML(mpXml, options);
    if (xmlParseResult.error) {
        delete xmlParseResult.nodes;
    }
    return (xmlParseResult as unknown) as MkXmlParseResult;
};
