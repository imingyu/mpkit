import { MkOmit, MkMap, MkEnumMap } from "./util";
import {
    FxNode,
    FxParseResult,
    FxWrong,
    FxLocation,
    FxNodeJSON,
    FxEventHandler,
    FxNodeAdapter,
} from "forgiving-xml-parser";
import { MpPlatform } from "./platform";
export interface MpSpec {
    [prop: string]: MkEnumMap<MpPlatform, MpViewSyntaxSpec>;
}
export interface MpViewSyntaxSpec {
    namespace: string;
    for: string;
    forItem: string;
    forIndex: string;
    key: string;
    if: string;
    elseif: string;
    else: string;
    forAndWhereAttrNeedBracket: boolean;
}
export enum MpWhereType {
    if = "if",
    elseif = "elseif",
    else = "else",
}
export enum MpEachType {
    key = "key",
    for = "for",
    forItem = "forItem",
    forIndex = "forIndex",
}
export interface MkMpXmlParseOptions {
    onEvent?: FxEventHandler;
}
export interface MkXmlContent {
    type: MpXmlContentType;
    value: string;
    locationInfo?: FxLocation;
}
export interface MkXmlContentParseResult {
    contents: MkXmlContent[];
    leftStaticContents: MkXmlContent[];
    leftStaticContentsIsEmpty: boolean;
    rightStaticContents: MkXmlContent[];
    rightStaticContentsIsEmpty: boolean;
    betweenStaticContents: MkXmlContent[];
    dynamicContents: MkXmlContent[];
}
export interface MpForAttrContent extends MkXmlContent {
    type: MpXmlContentType;
    value: string;
    featureList?: string;
    featureItem?: string;
    featureIndex?: string;
    featureKey?: string;
}
export interface IMkMpXmlAttrParseAdapter {
    parse(
        attr: FxNodeJSON,
        parent?: FxNodeJSON | LikeFxParseContext,
        grandpa?: FxNodeJSON | LikeFxParseContext
    ): MkXmlNode;
}
export interface IMkMpXmlContentParseAdapter {
    parse(
        content: string,
        node?: FxNodeJSON,
        parent?: FxNodeJSON | LikeFxParseContext,
        grandpa?: FxNodeJSON | LikeFxParseContext
    ): MkXmlContent[];
}
export interface IMkMpXmlParseAdapter {
    attrAdapters: MkMap<IMkMpXmlAttrParseAdapter>;
    contentAdapter: IMkMpXmlContentParseAdapter;
}
export enum MpXmlContentType {
    static = "static",
    dynamic = "dynamic",
}
export interface MkXmlNodeJSON
    extends MkOmit<FxNodeJSON, "attrs" | "children"> {
    attrs?: MkXmlNodeJSON[];
    children?: MkXmlNodeJSON[];
    mpContents?: MpForAttrContent[] | MkXmlContent[];
    special?: MpWhereType | MpEachType;
}
export interface LikeFxParseContext {
    nodes?: FxNode[] | FxNodeJSON[] | MkXmlNodeJSON[] | MkXmlNode[];
}
export interface MkXmlNode
    extends MkOmit<MkXmlNodeJSON, "attrs" | "children" | "parent"> {
    attrs?: MkXmlNode[];
    children?: MkXmlNode[];
    mpContents?: MpForAttrContent[] | MkXmlContent[];
    parent?: MkXmlNode;
    // 前一个兄弟：只在非text和comment的node上存在，且Sibling本身也非text和comment
    previousSibling?: MkXmlNode;
    // 后一个兄弟：只在非text和comment的node上存在，且Sibling本身也非text和comment
    nextSibling?: MkXmlNode;
}

export enum MkXmlParseMessagePosition {
    text = "text",
    attr = "attr",
}
export interface MkXmlParseMessage extends FxWrong {
    // position: MkXmlParseMessagePosition;
    target?: FxNode | FxNodeJSON;
}

export interface MkXmlParseResult extends MkOmit<FxParseResult, "nodes"> {
    nodes?: MkXmlNode[];
}

export interface MkXmlParseResultBase {
    error?: FxWrong;
    nodes?: MkXmlNode[];
}

export interface MkMpXmlParseAdapterFormater {
    parseAdapter?: IMkMpXmlParseAdapter;
    hasAttrAdapter: boolean;
    hasContentAdapter: boolean;
}
export interface MkNodeSerializer {
    (
        nodes: FxNodeJSON[],
        handler: MkNodeSerializeHandler,
        parentNode?: FxNodeJSON
    ): string;
}
export interface MkNodeSerializeHandler {
    (
        currentNode: MkXmlNodeJSON,
        brotherNodes: MkXmlNodeJSON[],
        rootNodes: MkXmlNodeJSON[],
        rootSerializer: MkNodeSerializer,
        parentNode: FxNodeJSON,
        adapter: FxNodeAdapter,
        serializeResult: string
    ): string;
}
