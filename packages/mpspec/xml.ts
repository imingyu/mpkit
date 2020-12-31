import {
    MkMpXmlAttrContentType,
    MkMpXmlAttrSpec,
    MkMpXmlDataBinding,
    MkMpXmlSpec,
} from "@mpkit/types";
import {
    attrElifValidater,
    attrElseValidater,
    attrForValidater,
} from "./validater";

export const commonDataBinding: MkMpXmlDataBinding = {
    leftBoundaryChar: "{{",
    rightBoundaryChar: "}}",
    leftBoundarySpace: -1,
    rightBoundarySpace: -1,
};
export const commonAttrSpec: MkMpXmlAttrSpec = {
    dataBinding: commonDataBinding,
    dataBindingCount: -1,
    require: 0,
    isEvent: false,
    requireContent: 0,
    contentType: MkMpXmlAttrContentType.string,
    supportVersion: "0.0.0",
};
const wechatAttrForValidater = attrForValidater("wx:for");
export const wechat: MkMpXmlSpec = {
    _common: {
        closeType: 0,
        dataBinding: commonDataBinding,
        dataBindingCount: -1,
        supportVersion: "0.0.0",
        attrsSpec: {
            _unclaimed: commonAttrSpec,
            "wx:if": {
                ...commonAttrSpec,
                requireContent: 1,
            },
            "wx:elif": {
                ...commonAttrSpec,
                requireContent: 1,
                validater: attrElifValidater("wx:if"),
            },
            "wx:else": {
                ...commonAttrSpec,
                validater: attrElseValidater("wx:if", "wx:elif"),
            },
            "wx:for-item": {
                ...commonAttrSpec,
                validater: wechatAttrForValidater,
            },
            "wx:for-index": {
                ...commonAttrSpec,
                validater: wechatAttrForValidater,
            },
        },
    },
};
let alipay: MkMpXmlSpec;
let smart: MkMpXmlSpec;
let tiktok: MkMpXmlSpec;

export { alipay, smart, tiktok };
