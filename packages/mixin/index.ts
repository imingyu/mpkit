import { MpViewType, MpView, MpMethodHook } from "@mpkit/types";
import {
    getMpPlatform,
    getMpInitLifeName,
    getApiVar,
    getMpViewType,
    isPromise,
    uuid,
} from "@mpkit/util";
import { MpPlatform } from "@mpkit/types";
import { mergeApi, mergeView, execHook } from "./mrege";
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
        let hooks = MixinStore.getHook(type);
        if (type === MpViewType.Component) {
            hooks = hooks.concat([
                {
                    observer: {
                        before() {
                            setMkSpec(this);
                        },
                    },
                },
            ]);
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
export { MixinStore };
export const MkApp = mkView(MpViewType.App);
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
                if (!this.$mkNativeSetData) {
                    this.$mkNativeSetData = this.setData;
                    this.setData = function betterSetData(
                        this: MpView,
                        ...args
                    ) {
                        const funId = uuid();
                        const type = getMpViewType(this);
                        const hooks = MixinStore.getHook(type);
                        try {
                            if (
                                execHook(
                                    hooks,
                                    this,
                                    "before",
                                    "setData",
                                    args,
                                    this.$mkNativeSetData,
                                    funId
                                ) !== false
                            ) {
                                let res;
                                if (
                                    (config.rewrite === true ||
                                        (config.rewrite[type] &&
                                            (config.rewrite as MpKitRewriteConfig)
                                                .setData)) &&
                                    mpkit.hasPlugin("set-data") &&
                                    mpkit.setData
                                ) {
                                    res = mpkit.setData.apply(mpkit, [
                                        this,
                                        ...args,
                                    ]);
                                } else {
                                    res = this.$mkNativeSetData.apply(
                                        this,
                                        args
                                    );
                                }
                                isPromise(res) &&
                                    res.catch((error) => {
                                        execHook(
                                            hooks,
                                            this,
                                            "catch",
                                            "setData",
                                            args,
                                            error,
                                            "PromiseReject",
                                            funId
                                        );
                                    });
                                execHook(
                                    hooks,
                                    this,
                                    "after",
                                    "setData",
                                    args,
                                    res,
                                    funId
                                );
                                return res;
                            }
                            args[1] && args[1]();
                        } catch (error) {
                            execHook(
                                hooks,
                                this,
                                "catch",
                                "setData",
                                args,
                                error,
                                "MethodError",
                                funId
                            );
                            throw error;
                        }
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
            MixinStore.addHook(MpViewType.Page, setDataMixin(MpViewType.Page));
            MixinStore.addHook(
                MpViewType.Component,
                setDataMixin(MpViewType.Component)
            );
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
                    App = function (spec) {
                        return MkNative.App(MkApp(spec));
                    };
                }
                if (tsRewrite.Page) {
                    Page = function (spec) {
                        return MkNative.Page(MkPage(spec));
                    };
                }
                if (tsRewrite.Component) {
                    Component = function (spec) {
                        return MkNative.Component(MkComponent(spec));
                    };
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
                App = function (spec) {
                    return MkNative.App(MkApp(spec));
                };
                Page = function (spec) {
                    return MkNative.Page(MkPage(spec));
                };
                Component = function (spec) {
                    return MkNative.Component(MkComponent(spec));
                };
                rewriteApi();
            }
        }
    },
};
