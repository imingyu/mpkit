// 处理内容
import { MpParseContentAdapter } from "./adapter";
import { MpPlatform } from "@mpkit/types";

export const MpWechatParseContentAdapter = new MpParseContentAdapter(
    MpPlatform.wechat
);
export const MpAlipayParseContentAdapter = new MpParseContentAdapter(
    MpPlatform.alipay
);
export const MpSmartParseContentAdapter = new MpParseContentAdapter(
    MpPlatform.smart
);
export const MpTiktokParseContentAdapter = new MpParseContentAdapter(
    MpPlatform.tiktok
);
