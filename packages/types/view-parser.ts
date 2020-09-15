import { MkOmit, MkMap, MkEnumMap } from "./util";
import { MpPlatform } from ".";
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
export interface MpXmlContent {
    type: MpXmlContentType;
    value: string;
}
export interface MpForAttrContent extends MpXmlContent {
    type: MpXmlContentType;
    value: string;
    featureItem: string;
    featureIndex: string;
    featureKey: string;
}
export interface ParseElementAdapterArg {
    currentElement: MkXmlElement;
    currentElementIndex: number;
    brotherElements: MkXmlElement[];
    allElements: MkXmlElement[];
    orgXml: string;
}
export interface IParseElementAdapter {
    attrAdapters: MkMap<IParseAttrAdapter>;
    contentAdapter: IParseContentAdapter;
    parse(data: ParseElementAdapterArg): MpXmlElement;
}
export interface ParseAttrAdapterArg {
    currentElement: MkXmlElement;
    currentElementIndex: number;
    brotherElements: MkXmlElement[];
    allElements: MkXmlElement[];
    orgXml: string;
    currentAttr: MkXmlElementAttr;
    allAttrs: MkXmlElementAttr[];
    prevParseAttr?: MpXmlElementAttr;
}
export interface IParseAttrAdapter {
    parse(data: ParseAttrAdapterArg): MpXmlElementAttr;
}
export interface IMpParseAttrAdapter
    extends IMpParseAdapter,
        IParseAttrAdapter {}
export interface IMpParseAdapter {
    mpPlatform: MpPlatform;
}
export interface IParseContentAdapter {
    parse(content: string): MpXmlContent[];
}

export enum MpXmlContentType {
    static = "static",
    dynamic = "dynamic",
}
export interface MpXmlParseResult extends MkOmit<MkXmlParseResult, "elements"> {
    elements?: MpXmlElement[];
}
export interface MpXmlElementAttr extends MkOmit<MkXmlElementAttr, "content"> {
    content?: MpXmlContent[];
}
export interface MpXmlElementToJSON {
    (): MkOmit<MpXmlElement, "parent" | "toJSON">;
}
export interface MpXmlElement
    extends MkOmit<MkXmlElement, "attrs" | "children" | "content"> {
    attrs?: MpXmlElementAttr[];
    children?: MpXmlElement[];
    content?: MpXmlContent[];
    parent?: MpXmlElement;
    toJSON: MpXmlElementToJSON;
}
export interface MkXmlSourceLocation {
    startLine: number;
    endLine: number;
    startCol: number;
    endCol: number;
    startOffset: number;
    endOffset: number;
}
export interface MkXmlSourceLocationInfo extends MkXmlSourceLocation {
    startTag?: MkXmlSourceLocation;
    endTag?: MkXmlSourceLocation;
    attrs?: {
        [prop: string]: MkXmlSourceLocation;
    };
}
export interface MkXmlElement {
    tag?: string;
    type: MkXmlElementType;
    attrs?: MkXmlElementAttr[];
    children?: MkXmlElement[];
    selfCloseing?: boolean;
    content?: string;
    sourceLocationInfo: MkXmlSourceLocationInfo;
}
export interface MkXmlParseResult {
    elements?: MkXmlElement[];
    error: MkValidateMessage;
    xml: string;
    xmlRows: string[];
}
export enum MkValidateMessagePosition {
    tag = "tag",
    attr = "attr",
    content = "content",
}
export interface MkValidateMessage {
    position?: MkValidateMessagePosition;
    target?:
        | MkXmlElement
        | MkXmlElementAttr
        | MpXmlContent
        | MpXmlElement
        | MpXmlElementAttr;
    message: string;
    fragment?: string;
}
export interface MkXmlTextElement extends MkXmlElement {
    type: MkXmlElementType.text;
    content: string;
}
export interface MkXmlCommentElement extends MkXmlElement {
    type: MkXmlElementType.comment;
    content: string;
}
export enum MkXmlElementType {
    node = "node",
    text = "text",
    comment = "comment",
}
export interface MkXmlElementAttr {
    name: string;
    content?: string;
    sourceLocationInfo: MkXmlSourceLocation;
}
