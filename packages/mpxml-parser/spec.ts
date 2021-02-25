import { MpViewSyntaxSpec, MpPlatform } from "@mpkit/types";
import { merge } from "@mpkit/util";

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
};
export const mpViewSyntaxSpec: { [prop in MpPlatform]?: MpViewSyntaxSpec } = {
    [MpPlatform.wechat]: MpWechatViewSyntaxSpec,
    [MpPlatform.alipay]: merge({}, MpWechatViewSyntaxSpec, {
        xmlFileSuffix: ".axml",
        xjsFileSuffix: ".sjs",
        xjsNodeName: "import-sjs",
        xjsModuleAttrName: "name",
        xjsSrcAttrName: "from",
        namespace: "a:",
    }) as MpViewSyntaxSpec,
    [MpPlatform.smart]: merge({}, MpWechatViewSyntaxSpec, {
        xmlFileSuffix: ".swan",
        xjsFileSuffix: ".sjs",
        xjsNodeName: "import-sjs",
        xjsModuleAttrName: "module",
        xjsSrcAttrName: "src",
        namespace: "s-",
        forAndWhereAttrNeedBracket: false,
    }) as MpViewSyntaxSpec,
    [MpPlatform.tiktok]: merge({}, MpWechatViewSyntaxSpec, {
        key: "",
        xmlFileSuffix: ".ttml",
        xjsFileSuffix: ".sjs",
        xjsNodeName: "sjs",
        xjsModuleAttrName: "module",
        xjsSrcAttrName: "src",
        namespace: "tt:",
    }) as MpViewSyntaxSpec,
};
