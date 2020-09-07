export interface MpViewParserOptions {}
export interface MkXmlElement {
    tag?: string;
    type: MkXmlElementType;
    attrs?: MkXmlElementAttr[];
    children?: MkXmlElement[];
    selfCloseing?: boolean;
    content?: string;
    sourceInfo?: {
        start: number;
        end: number;
        row: number;
        col: number;
    };
}
export interface MkXmlParseOptions {
    // 删除两端的空白字符
    trim?: boolean;
    // 是否验证含有根元素
    root?: boolean;
    // 是否转换自关闭
    selfCloseing: boolean;
    // 标签转换选项
    tag?: {};
    // 对于属性的转换选项，false代表忽略属性的转换
    attr?:
        | boolean
        | {
              // 是否忽略引号
              ignoreGuotationMarks?: boolean;
          };
}
export interface MkXmlParseResult {
    elements?: MkXmlElement[];
    error: MkXmlValidateMessage;
}
export interface MkXmlValidateResult extends MkXmlParseResult {
    correctXML?: string;
}
export interface MkXmlValidateMessage {
    message: string;
    row: number;
    col: number;
    fragment: string;
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
}
