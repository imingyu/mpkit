// 处理节点
import { MpParseElementAdapter } from "./adapter";
import { MpParseContentAdapter } from "./adapter";
import { MpPlatform, MkOmit } from "@mpkit/types";
import MpParseWhereAttrAdapter from "./attr-where";
import MpParseForAttrAdapter from "./attr-for";

const initElementAdapter = (mpPlatform: MpPlatform) => {
    const contentAdapter = new MpParseContentAdapter(mpPlatform);
    const whereAttrAdapter = new MpParseWhereAttrAdapter(mpPlatform);
    const forAttrAdapter = new MpParseForAttrAdapter(mpPlatform);
    return new MpParseElementAdapter(
        mpPlatform,
        {
            [whereAttrAdapter.ifValue]: whereAttrAdapter,
            [whereAttrAdapter.elseifValue]: whereAttrAdapter,
            [whereAttrAdapter.elseValue]: whereAttrAdapter,
            [forAttrAdapter.forValue]: forAttrAdapter,
            [forAttrAdapter.forItemValue]: forAttrAdapter,
            [forAttrAdapter.forIndexValue]: forAttrAdapter,
            [forAttrAdapter.forKeyValue]: forAttrAdapter,
        },
        contentAdapter
    );
};

export default {
    [MpPlatform.wechat]: initElementAdapter(MpPlatform.wechat),
    [MpPlatform.alipay]: initElementAdapter(MpPlatform.alipay),
    [MpPlatform.smart]: initElementAdapter(MpPlatform.smart),
    [MpPlatform.tiktok]: initElementAdapter(MpPlatform.tiktok),
} as {
    [prop in
        | MpPlatform.wechat
        | MpPlatform.alipay
        | MpPlatform.smart
        | MpPlatform.tiktok]: MpParseElementAdapter;
};
