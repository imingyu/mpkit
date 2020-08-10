import { MpViewType } from "@mpkit/types";
import { getMpPlatform } from "@mpkit/util";
import { MpPlatfrom } from "@mpkit/types";
import { mergeApi, merge } from "./mrege";
import MixinStore from "./store";
import {
    MpKitPlugin,
    MpKitInject,
    MpKitConfig,
    MpKitRewriteConfig,
} from "@mpkit/types";

export const MkApi = (() => {
    const paltform = getMpPlatform();
    if (paltform === MpPlatfrom.wechat) {
        return mergeApi(wx, MixinStore.getHook("Api"));
    } else if (paltform === MpPlatfrom.alipay) {
        return mergeApi(my, MixinStore.getHook("Api"));
    } else if (paltform === MpPlatfrom.smart) {
        return mergeApi(swan, MixinStore.getHook("Api"));
    } else if (paltform === MpPlatfrom.tiktok) {
        return mergeApi(tt, MixinStore.getHook("Api"));
    }
})();
export const MkApp = (...specList) => {
    return merge(MixinStore.getHook(MpViewType.App), ...specList);
};
export const MkPage = (...specList) => {
    return merge(MixinStore.getHook(MpViewType.Page), ...specList);
};
export const MkComponent = (...specList) => {
    return merge(MixinStore.getHook(MpViewType.Component), ...specList);
};
export const MkNative = {
    App,
    Page,
    Component,
    Api: null,
};

export const plugin: MpKitPlugin = {
    name: "mixin",
    apply(mpkit: MpKitInject, config?: MpKitConfig) {
        mpkit.App = MkApp;
        mpkit.Page = MkPage;
        mpkit.Component = MkComponent;
        if (config && config.rewrite) {
            const rewriteApi = () => {
                const paltform = getMpPlatform();
                if (paltform === MpPlatfrom.wechat) {
                    MkNative.Api = wx;
                    wx = mergeApi(wx, MixinStore.getHook("Api"));
                } else if (paltform === MpPlatfrom.alipay) {
                    MkNative.Api = my;
                    my = mergeApi(my, MixinStore.getHook("Api"));
                } else if (paltform === MpPlatfrom.smart) {
                    MkNative.Api = swan;
                    swan = mergeApi(swan, MixinStore.getHook("Api"));
                } else if (paltform === MpPlatfrom.tiktok) {
                    MkNative.Api = tt;
                    tt = mergeApi(tt, MixinStore.getHook("Api"));
                }
            };
            if (typeof config.rewrite === "object") {
                const tsRewrite = config.rewrite as MpKitRewriteConfig;
                if (tsRewrite.Api) {
                    rewriteApi();
                }
                if (tsRewrite.App) {
                    App = MkApp;
                }
                if (tsRewrite.Page) {
                    Page = MkPage;
                }
                if (tsRewrite.Component) {
                    Component = MkComponent;
                }
            } else {
                App = MkApp;
                Page = MkPage;
                Component = MkComponent;
                rewriteApi();
            }
        }
    },
};
