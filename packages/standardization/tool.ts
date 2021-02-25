import { MpPlatform } from "@mpkit/types";
import { getMpPlatform } from "@mpkit/util";

export const formatArgs = (
    ctxThis: any,
    ctx: any,
    platform: MpPlatform
): { ctx: any; platform: MpPlatform } => {
    ctx = ctx || ctxThis;
    platform = platform || getMpPlatform();
    return {
        ctx,
        platform,
    };
};
