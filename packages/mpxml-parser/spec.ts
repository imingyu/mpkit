import { MpViewSyntaxSpec, MpPlatform } from "@mpkit/types";

const MpWechatViewSyntaxSpec: MpViewSyntaxSpec = {
    namespace: "wx:",
    for: "for",
    forItem: "for-item",
    forIndex: "for-index",
    key: "key",
    if: "if",
    elseIf: "elif",
    else: "else",
    xmlFileSuffix: ".wxml",
    xjsFileSuffix: ".wxs",
    xjsNodeName: "wxs",
    xjsModuleAttrName: "module",
    xjsSrcAttrName: "src",
    forAndWhereAttrNeedBracket: true,
    importNodeName: "import",
    importSrcAttrName: "src",
    includeNodeName: "include",
    includeSrcAttrName: "src",
    mpxUnit: "rpx",
    cssFileSuffix: ".wxss",
    bindEvent: true,
    catchEvent: true,
    triggerCustomEvent: true,
    captureBindEvent: true,
    captureCatchEvent: true,
    mutBindEvent: true,
};
export const mpViewSyntaxSpec: { [prop in MpPlatform]?: MpViewSyntaxSpec } = {
    [MpPlatform.wechat]: MpWechatViewSyntaxSpec,
    [MpPlatform.alipay]: Object.assign({}, MpWechatViewSyntaxSpec, {
        xmlFileSuffix: ".axml",
        xjsFileSuffix: ".sjs",
        xjsNodeName: "import-sjs",
        xjsModuleAttrName: "name",
        xjsSrcAttrName: "from",
        namespace: "a:",
        cssFileSuffix: ".acss",
        triggerCustomEvent: false,
        captureBindEvent: false,
        captureCatchEvent: false,
        mutBindEvent: false,
    }) as MpViewSyntaxSpec,
    [MpPlatform.smart]: Object.assign({}, MpWechatViewSyntaxSpec, {
        xmlFileSuffix: ".swan",
        xjsFileSuffix: ".sjs",
        xjsNodeName: "import-sjs",
        xjsModuleAttrName: "module",
        xjsSrcAttrName: "src",
        namespace: "s-",
        forAndWhereAttrNeedBracket: false,
        cssFileSuffix: ".css",
        mutBindEvent: false,
    }) as MpViewSyntaxSpec,
    [MpPlatform.tiktok]: Object.assign({}, MpWechatViewSyntaxSpec, {
        key: "",
        xmlFileSuffix: ".ttml",
        xjsFileSuffix: ".sjs",
        xjsNodeName: "sjs",
        xjsModuleAttrName: "module",
        xjsSrcAttrName: "src",
        namespace: "tt:",
        cssFileSuffix: ".ttss",
        captureBindEvent: false,
        captureCatchEvent: false,
        mutBindEvent: false,
    }) as MpViewSyntaxSpec,
};
