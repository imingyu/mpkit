export interface MpViewParserOptions {
}
export interface MpElement {
    tag?: string;
    type: MpElementType;
    attrs?: MpElementAttr[];
    children?: MpElementContent[] | MpElement[];
    selfCloseing?: boolean;
}
export declare enum MpElementType {
    node = "node",
    text = "text",
    comment = "comment"
}
export interface MpElementAttr {
    name: string;
    value?: MpElementContent;
}
export declare enum MpElementContentType {
    number = "number",
    boolean = "boolean",
    string = "string",
    null = "null",
    dynamic = "dynamic"
}
export interface MpElementContent {
    type: MpElementContentType;
    value: string | number | boolean | null | MpDynamicValue;
}
export interface MpDynamicValue {
    source: string;
    ast: any;
}
