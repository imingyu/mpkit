export interface MpElement {
    tag: string;
}
export enum MpElementAttrType {
    number = "number",
    boolean = "boolean",
    string = "string",
    dynamic = "dynamic"
}
export interface MpElementAttr {
    name: string;
    value: string;
}