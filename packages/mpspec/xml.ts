import { MkMpXmlAttrSpec, MkMpXmlDataBinding, MkMpXmlSpec } from "@mpkit/types";

export const commonDataBinding: MkMpXmlDataBinding = {
    leftBoundaryChar: "{{",
    rightBoundaryChar: "}}",
    leftBoundarySpace: -1,
    rightBoundarySpace: -1,
};

export const wechat: MkMpXmlSpec = {
    _common: {
        closeType: 0,
        dataBinding: commonDataBinding,
        dataBindingCount: -1,
        attrsSpec: {
            _cnclaimed: {
                dataBinding: commonDataBinding,
                dataBindingCount: -1,
                require: 0,
                isEvent: false,
                requireContent: 0,
            } as MkMpXmlAttrSpec<string>,
        },
    },
};
let alipay: MkMpXmlSpec;
let smart: MkMpXmlSpec;
let tiktok: MkMpXmlSpec;

export { alipay, smart, tiktok };
