import { MpViewType, MpView, MpMethodHook } from "@mpkit/types";
import { getMpPlatform, getMpInitLifeName, getApiVar } from "@mpkit/util";
import { MpPlatform } from "@mpkit/types";
import { mergeApi, mergeView } from "./mrege";
import MixinStore from "./store";
import {
    MpKitPlugin,
    MpKitInject,
    MpKitConfig,
    MpKitRewriteConfig,
} from "@mpkit/types";
export { mergeApi, mergeView };

export const MkApi = (() => {
    const paltform = getMpPlatform();
    if (paltform === MpPlatform.wechat) {
        return mergeApi(wx, MixinStore.getHook("Api"));
    } else if (paltform === MpPlatform.alipay) {
        return mergeApi(my, MixinStore.getHook("Api"));
    } else if (paltform === MpPlatform.smart) {
        return mergeApi(swan, MixinStore.getHook("Api"));
    } else if (paltform === MpPlatform.tiktok) {
        return mergeApi(tt, MixinStore.getHook("Api"));
    }
})();
const mkView = (type: MpViewType) => {
    return (...specList) => {
        const setMkSpec = (view) => {
            if (!view.$mkSpec) {
                Object.defineProperty(view, "$mkSpec", {
                    get() {
                        return fullSpec;
                    },
                });
            }
        };
        const setSpecMixin = {
            [getMpInitLifeName(type)](this: MpView) {
                setMkSpec(this);
            },
        };
        const hooks = MixinStore.getHook(type);
        if (type === MpViewType.Component) {
            hooks.push({
                observer: {
                    before() {
                        setMkSpec(this);
                    },
                },
            });
        }
        const fullSpec = mergeView(
            type,
            getMpPlatform(),
            hooks,
            setSpecMixin,
            ...specList
        );
        return fullSpec;
    };
};
export const MkApp = mkView(MpViewType.Component);
export const MkPage = mkView(MpViewType.Page);
export const MkComponent = mkView(MpViewType.Component);
export const MkNative = {
    App: typeof App === "function" ? App : null,
    Page: typeof Page === "function" ? Page : null,
    Component: typeof Component === "function" ? Component : null,
    Api: getApiVar(),
};

export const plugin: MpKitPlugin = {
    name: "mixin",
    apply(mpkit: MpKitInject, config?: MpKitConfig) {
        MixinStore.bindEBus(mpkit);
        mpkit.MixinStore = MixinStore;
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
                if (paltform === MpPlatform.wechat) {
                    MkNative.Api = wx;
                    wx = mergeApi(wx, MixinStore.getHook("Api"));
                } else if (paltform === MpPlatform.alipay) {
                    MkNative.Api = my;
                    my = mergeApi(my, MixinStore.getHook("Api"));
                } else if (paltform === MpPlatform.smart) {
                    MkNative.Api = swan;
                    swan = mergeApi(swan, MixinStore.getHook("Api"));
                } else if (paltform === MpPlatform.tiktok) {
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
