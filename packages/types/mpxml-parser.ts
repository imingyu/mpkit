import { MkOmit, MkMap, MkEnumMap } from "./util";
import { FxNode, FxParseResult } from "forgiving-xml-parser";
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
export interface MkXmlContent {
    type: MpXmlContentType;
    value: string;
}
export interface MpForAttrContent extends MkXmlContent {
    type: MpXmlContentType;
    value: string;
    featureList?: string;
    featureItem?: string;
    featureIndex?: string;
    featureKey?: string;
}
export interface MkParseElementAdapterArg {
    currentElement: FxNode;
    currentElementIndex: number;
    brotherElements: FxNode[];
    allElements: FxNode[];
    xml: string;
}
export interface IParseElementAdapter {
    attrAdapters: MkMap<IParseAttrAdapter>;
    contentAdapter: IParseContentAdapter;
    parse(data: MkParseElementAdapterArg): MkXmlNode;
}
export interface MkParseAttrAdapterArg {
    currentElement: FxNode;
    currentElementIndex: number;
    brotherElements: FxNode[];
    allElements: FxNode[];
    xml: string;
    currentAttr: FxNode;
    allAttrs: FxNode[];
    prevParseAttr?: MkXmlNode;
}
export interface IParseAttrAdapter {
    parse(data: MkParseAttrAdapterArg): MkXmlNode;
}
export interface IMpParseAttrAdapter
    extends IMpParseAdapter,
        IParseAttrAdapter {}
export interface IMpParseAdapter {
    mpPlatform: MpPlatform;
}
export interface IParseContentAdapter {
    parse(content: string): MkXmlContent[];
}

export enum MpXmlContentType {
    static = "static",
    dynamic = "dynamic",
}
export interface MkXmlNode
    extends MkOmit<FxNode, "content" | "attrs" | "children" | "parent"> {
    attrs?: MkXmlNode[];
    children?: MkXmlNode[];
    content?: MpForAttrContent[] | MkXmlContent[];
    parent?: MkXmlNode;
}

export enum MkValidateMessagePosition {
    tag = "tag",
    attr = "attr",
    content = "content",
}

export interface MkXmlParseResult extends MkOmit<FxParseResult, "nodes"> {
    nodes?: MkXmlNode[];
}
