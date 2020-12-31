import { MpPlatform } from "./platform";
import { MkOmit, MkRequireAll } from "./util";

export type MkMpSDKVersion<
    N extends number = number,
    S extends string = `${N}.${N}.${N}`
> = S;

export interface LikeMkMpSDKVersionSupport {
    supportVersion?: MkMpSDKVersion;
}
export interface MkMpSDKVersionSupport
    extends MkRequireAll<LikeMkMpSDKVersionSupport> {}

// xml绑定变量语法，如：{{xx}}
export interface LikeMkMpXmlDataBinding {
    // 左边界字符串
    leftBoundaryChar?: string;
    // 右边界字符串
    rightBoundaryChar?: string;
    // 左边界符距离内容可被允许包含的空白字符数量，小于0|undefined=允许左边界与内容之间出现空白字符且不限数量；0=不允许；大于0代表必须有，且数量一致
    leftBoundarySpace?: number;
    // 右边界符距离内容可被允许包含的空白字符数量，小于0|undefined=允许左边界与内容之间出现空白字符且不限数量；0=不允许；大于0代表必须有，且数量一致
    rightBoundarySpace?: number;
}
export interface MkMpXmlDataBinding
    extends MkRequireAll<LikeMkMpXmlDataBinding> {}

// 是否支持数据绑定
export interface MkMpXmlSupportDataBinding {
    // 是否支持变量绑定
    dataBinding?: MkMpXmlDataBinding;
    // 支持的变量绑定数量，0代表不支持，小于0代表支持无限个，大于0代表具体数量
    dataBindingCount?: number;
}
export enum MkMpXmlAstContentType {
    static = "static",
    dataBinding = "dataBinding",
}
export interface MkMpXmlAstContent {
    type: MkMpXmlAstContentType;
    value: string;
}
// xml ast 节点
export interface MkMpXmlAstNode {
    name: string;
    content?: string;
    mpContents?: MkMpXmlAstContent[];
}
// xml ast 属性
export interface MkMpXmlAstAttr extends MkMpXmlAstNode {}
// xml ast 元素
export interface MkMpXmlAstElement extends MkMpXmlAstNode {
    attrs?: MkMpXmlAstAttr[];
    children?: MkMpXmlAstElement[];
    // 前一个兄弟：只在非text和comment的node上存在，且Sibling本身也非text和comment
    previousSibling?: MkMpXmlAstElement;
    // 后一个兄弟：只在非text和comment的node上存在，且Sibling本身也非text和comment
    nextSibling?: MkMpXmlAstElement;
}

export interface MkMpXmlAstPreviousSiblingFinder {
    (node: MkMpXmlAstElement, siblings: MkMpXmlAstElement[]): MkMpXmlAstElement;
}

// xml 属性验证器
export interface MkMpXmlNodeValidater {
    (
        attr: MkMpXmlAstAttr, // 属性ast对象
        parent: MkMpXmlAstElement, // 属性的父节点ast对象
        grandpa?: MkMpXmlAstElement, // 属性的爷爷节点ast对象
        previousSiblingFinder?: MkMpXmlAstPreviousSiblingFinder // 查找前一个节点的函数
    ): boolean | MkMpXmlNodeValidateResult;
}
export enum MkMpXmlNodeValidateResultLevel {
    success = "success",
    fail = "fail",
    warn = "warn",
    ignore = "ignore",
}
export interface MkMpXmlNodeValidateResult {
    pass: boolean;
    level: MkMpXmlNodeValidateResultLevel;
    code: string;
    message: string;
}
export enum MkMpXmlAttrContentType {
    string = "string",
    boolean = "boolean",
    number = "number",
}
// xml 属性 技术特性
export interface LikeMkMpXmlAttrSpec
    extends MkMpXmlSupportDataBinding,
        LikeMkMpSDKVersionSupport {
    // 内容必选？0|undefined=可有可没有，小于0=必须没有，1=必须有，但是可为空，大于1=必须有，且不为空（含任意字符串）
    requireContent?: number;
    // 是否必选？0|undefined=可有可没有，小于0=必须没有，大于0=必须有
    require?: number;
    // 该属性是否是事件绑定
    isEvent?: boolean;
    // 内容类型
    contentType?: MkMpXmlAttrContentType | MkMpXmlAttrContentType[];
    // 默认内容
    defaultContent?: any;
    validater?: MkMpXmlNodeValidater;
}

export interface MkMpXmlAttrSpec
    extends MkOmit<
        MkRequireAll<LikeMkMpXmlAttrSpec>,
        "defaultContent" | "validater"
    > {
    defaultContent?: any;
    validater?: MkMpXmlNodeValidater;
}

export interface MkMpXmlNodeSpecMap<T> {
    // 匹配所有目标节点
    _common?: T;
    // 指定的名称均匹配不上时，采用此特性，最后采用的特性将是_common&&_unclaimed
    _unclaimed?: T;
    // 按照名称匹配，最后的该名称对应的节点特定将是此属性与_common的合并体
    [p: string]: T;
}

export interface LikeMkMpXmlElementSpec
    extends MkMpXmlSupportDataBinding,
        LikeMkMpSDKVersionSupport {
    // 节点关闭类型，0|undefined=自关闭或结束标签关闭均可以；小于0=只可以自关闭方式关闭；大于0=必须通过结束标签关闭
    closeType?: number;
    // 属性特性
    attrsSpec?: MkMpXmlNodeSpecMap<LikeMkMpXmlAttrSpec>;
}
// xml 节点 技术特性
export interface MkMpXmlElementSpec
    extends MkOmit<MkRequireAll<LikeMkMpXmlElementSpec>, "attrsSpec">,
        MkMpSDKVersionSupport {
    attrsSpec: MkMpXmlNodeSpecMap<MkMpXmlAttrSpec>;
}
// xml 节点对象
export interface MkMpXmlElement {
    id?: string;
    dataset?: {
        [p: string]: any;
    };
}
// xml 事件对象
export interface MkMpXmlBaseEvent<T = undefined> {
    type: string;
    timeStamp: number;
    target: MkMpXmlElement;
    currentTarget: MkMpXmlElement;
    detail?: T;
}

// xml 事件处理程序
export interface MkMpXmlEventHandler<D = undefined, T = MkMpXmlBaseEvent<D>> {
    (event: T);
}

// xml 技术特性
export interface LikeMkMpXmlSpec
    extends MkMpXmlNodeSpecMap<LikeMkMpXmlElementSpec> {}
export interface MkMpXmlSpec extends MkMpXmlNodeSpecMap<MkMpXmlElementSpec> {}

export interface MkMpPlatformSpec<T> {
    [MpPlatform.wechat]: T;
    [MpPlatform.alipay]: T;
    [MpPlatform.smart]: T;
    [MpPlatform.tiktok]: T;
}
