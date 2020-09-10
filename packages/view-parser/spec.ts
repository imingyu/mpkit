import { MpViewSyntaxSpec, MpPlatform, MpSpec } from "@mpkit/types";
import { merge } from "@mpkit/util";

const MpWechatViewSyntaxSpec: MpViewSyntaxSpec = {
    namespace: "wx:",
    for: "for",
    forItem: "for-item",
    forIndex: "for-index",
    key: "key",
    if: "if",
    elseif: "elif",
    else: "else",
    forAndWhereAttrNeedBracket: true,
};
export default ({
    ViewSyntax: {
        [MpPlatform.wechat]: MpWechatViewSyntaxSpec,
        [MpPlatform.alipay]: merge({}, MpWechatViewSyntaxSpec, {
            namespace: "a:",
        }) as MpViewSyntaxSpec,
        [MpPlatform.smart]: merge({}, MpWechatViewSyntaxSpec, {
            namespace: "s-",
            forAndWhereAttrNeedBracket: false,
        }) as MpViewSyntaxSpec,
        [MpPlatform.tiktok]: merge({}, MpWechatViewSyntaxSpec, {
            namespace: "tt:",
        }) as MpViewSyntaxSpec,
    },
} as unknown) as MpSpec;
