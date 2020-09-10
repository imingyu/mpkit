// 处理节点
import { MpParseElementAdapter } from "./adapter";
import { MpPlatform } from "@mpkit/types";

export const MpWechatParseElementAdapter = new MpParseElementAdapter(
    MpPlatform.wechat
);
export const MpAlipayParseElementAdapter = new MpParseElementAdapter(
    MpPlatform.alipay
);
export const MpSmartParseElementAdapter = new MpParseElementAdapter(
    MpPlatform.smart
);
export const MpTiktokParseElementAdapter = new MpParseElementAdapter(
    MpPlatform.tiktok
);
