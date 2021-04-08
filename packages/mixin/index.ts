import { MpViewType, MpView, MpMethodHook } from "@mpkit/types";
import {
    getMpPlatform,
    getMpInitLifeName,
    getApiVar,
    getMpViewType,
    isFunc,
    isMpIvew,
    getMpViewPathName,
} from "@mpkit/util";
import { mergeApi, mergeView, promiseifyApi } from "./mrege";
import MixinStore from "./store";
import {
    MpKitPlugin,
    MpKitInject,
    MpKitConfig,
    MpKitRewriteConfig,
    MpPlatform,
} from "@mpkit/types";
import { hookViewMethod } from "./view";
import { createFuncGeneralHook, FuncIDHook } from "./hook";
export { mergeApi, mergeView, promiseifyApi };
export * from "./hook";
export * from "./api";
export * from "./view";

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
            if (view && isMpIvew(view)) {
                if (!view.$mkSpec) {
                    Object.defineProperty(view, "$mkSpec", {
                        get() {
                            return fullSpec;
                        },
                    });
                }
                if (!fullSpec.$targetPath) {
                    fullSpec.$targetPath = getMpViewPathName(view);
                }
            }
        };
        let rewriteSetData =
            type === MpViewType.Component || type === MpViewType.Page;
        const hooks: MpMethodHook[] = [];
        const beforeHooks: MpMethodHook[] = [
            {
                [getMpInitLifeName(type)]: {
                    before() {
                        setMkSpec(this);
                        if (rewriteSetData && !this.$mkNativeSetData) {
                            this.$mkNativeSetData = this.setData;
                            this.setData = hookViewMethod(
                                "setData",
                                this.$mkNativeSetData,
                                null,
                                [
                                    FuncIDHook,
                                    createFuncGeneralHook(
                                        MixinStore.getHook(type)
                                    ),
                                ]
                            );
                        }
                    },
                },
            },
        ];
        if (type === MpViewType.Component) {
            beforeHooks[0].observer = {
                before() {
                    setMkSpec(this);
                },
            };
        }
        hooks.push(...beforeHooks);
        hooks.push(...(MixinStore.getHook(type) || []));

        specList.forEach((spec) => {
            if (spec && typeof spec === "object" && isFunc(spec.$mixinBegin)) {
                spec.$mixinBegin(spec, specList);
            }
        });

        const fullSpec = mergeView(type, getMpPlatform(), hooks, ...specList);
        if (isFunc(fullSpec.$mixinEnd)) {
            fullSpec.$mixinEnd(fullSpec);
        }
        delete fullSpec.$mixinBegin;
        delete fullSpec.$mixinEnd;
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
        mpkit.MixinStore = MixinStore;
        mpkit.App = MkApp;
        mpkit.Page = MkPage;
        mpkit.Component = MkComponent;
        if (config && config.rewrite) {
            const rewriteSetData = function rewriteSetData(this: MpView) {
                const type = getMpViewType(this);
                if (
                    !this.$mkDiffSetDataBeforeValue &&
                    (config.rewrite === true ||
                        (config.rewrite[type] &&
                            (config.rewrite as MpKitRewriteConfig).setData)) &&
                    mpkit.hasPlugin("set-data") &&
                    mpkit.setData
                ) {
                    this.$mkDiffSetDataBeforeValue = this.setData;
                    this.setData = function DiffSetData(this: MpView, ...args) {
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
