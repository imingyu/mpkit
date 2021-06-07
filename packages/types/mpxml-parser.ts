import { MkOmit, MkMap } from "./util";
import {
    FxNode,
    FxParseResult,
    FxWrong,
    FxLocation,
    FxNodeJSON,
    FxEventHandler,
    FxNodeAdapter,
    FxSerializeOptions,
} from "forgiving-xml-parser";
import { MpPlatform } from "./platform";
export interface MpViewSyntaxSpec {
    namespace: string;
    for: string;
    forItem: string;
    forIndex: string;
    key: string;
    if: string;
    elseIf: string;
    else: string;
    xmlFileSuffix: string;
    xjsNodeName?: string;
    xjsFileSuffix?: string;
    xjsModuleAttrName?: string;
    xjsSrcAttrName?: string;
    forAndWhereAttrNeedBracket: boolean;
    importNodeName?: string;
    importSrcAttrName?: string;
    includeNodeName?: string;
    includeSrcAttrName?: string;
    mpxUnit: string;
    cssFileSuffix: string;
    triggerCustomEvent: boolean;
    bindEvent: boolean;
    catchEvent: boolean;
    mutBindEvent: boolean;
    captureBindEvent: boolean;
    captureCatchEvent: boolean;
}

// export interface MkMpXmlParseRuleMatcher extends FxEventHandler {}
// export interface MkMpXmlParseRuleHnalder extends FxEventHandler {}
// export interface MkMpXmlParseRule {
//     target: FxEventType | FxNodeType | MkMpXmlParseRuleMatcher;
//     handler: MkMpXmlParseRuleHnalder;
// }
export type MkPlatformNodeAdapterMap = {
    [prop in MpPlatform]?: FxNodeAdapter[];
};
export interface MkMpXmlParseOptions {
    onEvent?: FxEventHandler;
    // rules?: MkMpXmlParseRule[];
}
export interface MkMpXmlSerializeOptions extends FxSerializeOptions {}
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
export interface MkMpXmlParseContext {
    xjsModuleNames?: []; // 该页面引入的wxs/sjs...之类的模块名称
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
export const enum MpXmlContentType {
    static = "static",
    dynamic = "dynamic",
}
export interface MkXmlNodeJSON
    extends MkOmit<FxNodeJSON, "attrs" | "children"> {
    attrs?: MkXmlNodeJSON[];
    children?: MkXmlNodeJSON[];
    mpContents?: MpForAttrContent[] | MkXmlContent[];
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

export interface MkXmlParseMessage extends FxWrong {
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
