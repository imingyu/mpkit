import { MkOmit, MkMap } from "./util";
export interface MpXmlContent {
    type: MpXmlContentType;
    value: string;
}
export interface IParseElementAdapter {
    attrAdapters: MkMap<IParseAttrAdapter>;
    contentAdapter: IParseContentAdapter;
    parse(
        currentElement: MkXmlElement,
        allElements: MkXmlElement[],
        orgXml: string
    ): MpXmlElement;
}
export interface IParseAttrAdapter {
    parse(
        currentElement: MkXmlElement,
        allElements: MkXmlElement[],
        orgXml: string,
        currentAttr: MkXmlElementAttr,
        allAttrs: MkXmlElementAttr[],
        prevParseAttr?: MpXmlElementAttr
    ): MpXmlElementAttr;
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
export interface MpXmlElement
    extends MkOmit<MkXmlElement, "attrs" | "children" | "content"> {
    attrs?: MpXmlElementAttr[];
    children?: MpXmlElement[];
    content?: MpXmlContent[];
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
}
export interface MkXmlValidateResult extends MkXmlParseResult {
    correctXML?: string;
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
