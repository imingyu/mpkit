// 处理节点
import { contentAdapter } from "./content";
import { IMkMpXmlParseAdapter, MpPlatform } from "@mpkit/types";
import MpParseWhereAttrAdapter from "./attr-where";
import MpParseForAttrAdapter from "./attr-for";
import { MkBaseAttrParseAdapter } from "./attr-base";

const initMpXmlParseAdapter = (
    mpPlatform: MpPlatform
): IMkMpXmlParseAdapter => {
    const whereAttrAdapter = new MpParseWhereAttrAdapter(mpPlatform);
    const forAttrAdapter = new MpParseForAttrAdapter(mpPlatform);
    const res = {
        attrAdapters: {
            [whereAttrAdapter.ifValue]: whereAttrAdapter,
            [whereAttrAdapter.elseifValue]: whereAttrAdapter,
            [whereAttrAdapter.elseValue]: whereAttrAdapter,
            [forAttrAdapter.forValue]: forAttrAdapter,
            [forAttrAdapter.forItemValue]: forAttrAdapter,
            [forAttrAdapter.forIndexValue]: forAttrAdapter,
            __unclaimed: new MkBaseAttrParseAdapter(mpPlatform),
        },
        contentAdapter,
    };
    if (forAttrAdapter.forKeyValue) {
        res.attrAdapters[forAttrAdapter.forKeyValue] = forAttrAdapter;
    }
    return res;
};

export const MpPlatformAdapters = {
    [MpPlatform.wechat]: initMpXmlParseAdapter(MpPlatform.wechat),
    [MpPlatform.alipay]: initMpXmlParseAdapter(MpPlatform.alipay),
    [MpPlatform.smart]: initMpXmlParseAdapter(MpPlatform.smart),
    [MpPlatform.tiktok]: initMpXmlParseAdapter(MpPlatform.tiktok),
} as {
    [prop in
        | MpPlatform.wechat
        | MpPlatform.alipay
        | MpPlatform.smart
        | MpPlatform.tiktok]: IMkMpXmlParseAdapter;
};
