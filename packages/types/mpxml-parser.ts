import { MkOmit, MkMap, MkEnumMap } from "./util";
import {
    FxNode,
    FxParseResult,
    FxWrong,
    FxLocation,
    FxNodeJSON,
    FxEventHandler,
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
    parse(attr: FxNodeJSON): MkXmlNode;
    parse(
        attr: FxNodeJSON,
        parent: FxNodeJSON,
        grandpa?: FxNodeJSON
    ): MkXmlNode;
}
export interface IMkMpXmlContentParseAdapter {
    parse(content: string, node?: FxNodeJSON): MkXmlContent[];
    parse(
        content: string,
        node: FxNodeJSON,
        parent: FxNodeJSON,
        grandpa?: FxNodeJSON
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
export interface MkXmlNode
    extends MkOmit<FxNodeJSON, "attrs" | "children" | "parent"> {
    attrs?: MkXmlNode[];
    children?: MkXmlNode[];
    mpContents?: MpForAttrContent[] | MkXmlContent[];
    parent?: MkXmlNode;
    previousSibling?: MkXmlNode;
    nextSibling?: MkXmlNode;
}

export enum MkXmlParseMessagePosition {
    text = "text",
    attr = "attr",
}
export interface MkXmlParseMessage extends FxWrong {
    position: MkXmlParseMessagePosition;
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
