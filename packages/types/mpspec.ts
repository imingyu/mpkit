import { MpPlatform } from "./platform";
import { MkOmit, MkRequireAll } from "./util";

// xml绑定变量语法，如：{{xx}}
export interface LikeMkMpXmlDataBinding {
    // 左边界字符串
    leftBoundaryChar?: string;
    // 右边界字符串
    rightBoundaryChar?: string;
    // 左边界符距离内容可被允许包含的空白字符数量，<0|undefined=允许左边界与内容之间出现空白字符且不限数量；0=不允许；>0代表必须有，且数量一致
    leftBoundarySpace?: number;
    // 右边界符距离内容可被允许包含的空白字符数量，<0|undefined=允许左边界与内容之间出现空白字符且不限数量；0=不允许；>0代表必须有，且数量一致
    rightBoundarySpace?: number;
}
export interface MkMpXmlDataBinding
    extends MkRequireAll<LikeMkMpXmlDataBinding> {}

// 是否支持数据绑定
export interface MkMpXmlSupportDataBinding {
    // 是否支持变量绑定
    dataBinding?: MkMpXmlDataBinding;
    // 支持的变量绑定数量，0代表不支持，<0代表支持无限个，>0代表具体数量
    dataBindingCount?: number;
}
// xml 属性 技术特性
export interface LikeMkMpXmlAttrSpec<T = string>
    extends MkMpXmlSupportDataBinding {
    // 内容必选？0|undefined=可有可没有，<0=必须没有，>0=必须有，且不为空（含义任意字符串）
    requireContent?: number;
    // 是否必选？0|undefined=可有可没有，<0=必须没有，>0=必须有
    require?: number;
    // 内容的类型
    contentType?: T;
    // 该属性是否是事件绑定
    isEvent?: boolean;
}

export interface MkMpXmlAttrSpec<T = string>
    extends MkRequireAll<LikeMkMpXmlAttrSpec<T>> {}

export interface MkMpXmlNodeSpecMap<T> {
    // 匹配所有目标节点
    _common?: T;
    // 指定的名称均匹配不上时，采用此特性，最后采用的特性将是_common&&_cnclaimed
    _cnclaimed?: T;
    // 按照名称匹配，最后的该名称对应的节点特定将是此属性与_common的合并体
    [p: string]: T;
}

export interface LikeMkMpXmlElementSpec extends MkMpXmlSupportDataBinding {
    // 节点关闭类型，0|undefined=自关闭或结束标签关闭均可以；<0=只可以自关闭方式关闭；>0=必须通过结束标签关闭
    closeType?: number;
    // 属性特性
    attrsSpec?: MkMpXmlNodeSpecMap<LikeMkMpXmlAttrSpec<any>>;
}
// xml 节点 技术特性
export interface MkMpXmlElementSpec
    extends MkOmit<MkRequireAll<LikeMkMpXmlElementSpec>, "attrsSpec"> {
    attrsSpec: MkMpXmlNodeSpecMap<MkMpXmlAttrSpec<any>>;
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
