import { MpViewType, MpView, MpMethodHook } from "@mpkit/types";
import { getMpPlatform, getMpInitLifeName } from "@mpkit/util";
import { MpPlatfrom } from "@mpkit/types";
import { mergeApi, mergeView } from "./mrege";
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
    return mergeView(MixinStore.getHook(MpViewType.App), ...specList);
};
export const MkPage = (...specList) => {
    return mergeView(MixinStore.getHook(MpViewType.Page), ...specList);
};
export const MkComponent = (...specList) => {
    return mergeView(MixinStore.getHook(MpViewType.Component), ...specList);
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
        MixinStore.bindEBus(mpkit);
        mpkit.App = MkApp;
        mpkit.Page = MkPage;
        mpkit.Component = MkComponent;
        if (config && config.rewrite) {
            const rewriteSetData = function rewriteSetData(this: MpView) {
                if (
                    mpkit.hasPlugin("set-data") &&
                    mpkit.setData &&
                    !this.$mkNativeSetData
                ) {
                    this.$mkNativeSetData = this.setData;
                    this.setData = function betterSetData(
                        this: MpView,
                        ...args
                    ) {
                        return mpkit.setData.apply(mpkit, [this, ...args]);
                    };
                }
            };
            const setDataMixin = (type: MpViewType): MpMethodHook => {
                return {
                    [getMpInitLifeName(type)]: {
                        before() {
                            rewriteSetData.call(this);
                        },
                    },
                    observer: {
                        before() {
                            rewriteSetData.call(this);
                        },
                    },
                };
            };
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
                    if (tsRewrite.setData) {
                        MixinStore.addHook(
                            MpViewType.Page,
                            setDataMixin(MpViewType.Page)
                        );
                    }
                }
                if (tsRewrite.Component) {
                    Component = MkComponent;
                    if (tsRewrite.setData) {
                        MixinStore.addHook(
                            MpViewType.Component,
                            setDataMixin(MpViewType.Component)
                        );
                    }
                }
            } else {
                MixinStore.addHook(
                    MpViewType.Page,
                    setDataMixin(MpViewType.Page)
                );
                MixinStore.addHook(
                    MpViewType.Component,
                    setDataMixin(MpViewType.Component)
                );
                App = MkApp;
                Page = MkPage;
                Component = MkComponent;
                rewriteApi();
            }
        }
    },
};
