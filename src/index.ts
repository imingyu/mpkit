import EventEmitter from "./event-emitter";
import { merge, MethodHook, mergeApi } from "./merge";
import setData from "./set-data";
import { getMpPlatform, getMpInitLifeName, getMpMountLifeName } from "./util";
import { MpPlatfrom, EventType, MpViewType } from "./enum";
import {
    initView,
    MpView,
    getMpViewType,
    MpAlipayViewComponent,
    MpSmartViewComponent,
    MpWechatView,
    getMpNativeViewId,
    getMpComponentPageNativeViewId,
} from "./view";

const EV = new EventEmitter();
const STATIC_VIEW_HOOK = {} as {
    [prop: string]: MethodHook[];
};
const emitEvent = (type: EventType, data: any) => {
    EV.emit(EventType.All, {
        eventType: type,
        ...data,
    });
    EV.emit(type, data);
};
const getViewMethodHook = (viewType: MpViewType): MethodHook[] => {
    if (!STATIC_VIEW_HOOK[viewType]) {
        STATIC_VIEW_HOOK[viewType] = [
            {
                before(methodName, methodArgs) {
                    emitEvent(EventType.ViewMethodStart, {
                        view: this,
                        methodName,
                        methodArgs,
                    });
                    if (methodArgs[0] && methodArgs[0].currentTarget) {
                        emitEvent(EventType.UIEvent, {
                            view: this,
                            triggerMethod: methodName,
                            event: methodArgs[0],
                            triggerMethodArgs: methodArgs,
                        });
                    }
                },
                after(methodName, methodArgs, methodResult) {
                    emitEvent(EventType.ViewMethodEnd, {
                        view: this,
                        methodName,
                        methodArgs,
                        methodResult,
                    });
                },
                catch(methodName, methodArgs, error, errType) {
                    emitEvent(EventType.Error, {
                        view: this,
                        type: errType || "ViewMethod",
                        methodName,
                        methodArgs,
                        error,
                    });
                },
                [getMpInitLifeName(viewType)]: {
                    before(methodName, methodArgs) {
                        initView(this, viewType);
                        ViewInstanceTimeLine.push(this);
                        if (viewType === MpViewType.App) {
                            ViewInstanceList[viewType][this.$mkKey] = this;
                        } else {
                            ViewInstanceList[viewType][this.$mkKey] = this;
                        }
                        emitEvent(EventType.ViewInitLife, {
                            view: this,
                            life: methodName,
                            options: methodArgs[0],
                        });
                    },
                },
                [getMpMountLifeName(viewType)]: {
                    before(methodName, methodArgs) {
                        initView(this, viewType);
                        emitEvent(EventType.ViewInitMount, {
                            view: this,
                            life: methodName,
                        });
                    },
                },
            },
        ];
    }
    return STATIC_VIEW_HOOK[viewType] as MethodHook[];
};
const getApiMethodHook = (): MethodHook[] => {
    if (!STATIC_VIEW_HOOK["Api"]) {
        STATIC_VIEW_HOOK["Api"] = [
            {
                before(methodName, methodArgs, methodHandler, funId) {
                    emitEvent(EventType.ApiMethodStart, {
                        methodName,
                        methodArgs,
                        funId,
                    });
                },
                after(methodName, methodArgs, result, funId) {
                    emitEvent(EventType.ApiMethodEnd, {
                        methodName,
                        methodArgs,
                        result,
                        funId,
                    });
                    if (methodName === "request") {
                        emitEvent(EventType.RequestStart, {
                            task: result,
                            options: methodArgs[0],
                            funId,
                        });
                    }
                },
                complete(
                    methodName: string,
                    methodArgs: any[],
                    result: any,
                    success?: boolean,
                    funId?: string
                ) {
                    emitEvent(EventType.ApiMethodComplete, {
                        methodName,
                        methodArgs,
                        result,
                        success,
                        funId,
                    });
                    if (methodName === "request") {
                        emitEvent(EventType.RequestEnd, {
                            result,
                            options: methodArgs[0],
                            funId,
                            success,
                        });
                    }
                },
            },
        ];
    }
    return STATIC_VIEW_HOOK["Api"];
};
export const ViewInstanceList = {
    [MpViewType.App]: null,
    [MpViewType.Page]: {},
    [MpViewType.Component]: {},
};
export const ViewInstanceTimeLine = [];
export { EventEmitter, setData };
export * from "./view";
export * from "./util";
export const on = EV.on;
export const off = EV.off;
export const emit = EV.emit;
export const addViewMethodHook = (viewType: MpViewType, hook: MethodHook) => {
    hook && getViewMethodHook(viewType).push(hook);
};
export const addApiMethodHook = (hook: MethodHook) => {
    hook && getApiMethodHook().push(hook);
};
export const MpApi = (() => {
    const paltform = getMpPlatform();
    if (paltform === MpPlatfrom.wechat) {
        return mergeApi(wx, getApiMethodHook());
    } else if (paltform === MpPlatfrom.alipay) {
        return mergeApi(my, getApiMethodHook());
    } else if (paltform === MpPlatfrom.smart) {
        return mergeApi(swan, getApiMethodHook());
    } else if (paltform === MpPlatfrom.tiktok) {
        return mergeApi(tt, getApiMethodHook());
    }
})();
export const App = (...specList) => {
    return merge(getViewMethodHook(MpViewType.App), ...specList);
};
export const Page = (...specList) => {
    return merge(getViewMethodHook(MpViewType.Page), ...specList);
};
export const Component = (...specList) => {
    return merge(getViewMethodHook(MpViewType.Component), ...specList);
};
export const getInsidePage = (componentView: MpView): Promise<MpView> => {
    const viewType = getMpViewType(componentView);
    if (viewType === MpViewType.Component) {
        const MP_PLATFORM: MpPlatfrom = getMpPlatform();
        if (MP_PLATFORM === MpPlatfrom.wechat) {
            return Promise.resolve(
                (componentView as MpWechatView).selectOwnerComponent() as MpWechatView
            );
        }
        if (MP_PLATFORM === MpPlatfrom.alipay) {
            return Promise.resolve((componentView as MpAlipayViewComponent).$page);
        }
        if (MP_PLATFORM === MpPlatfrom.smart) {
            return Promise.resolve((componentView as MpSmartViewComponent).pageinstance);
        }
        if (MP_PLATFORM === MpPlatfrom.tiktok) {
            if (!componentView.$mkType) {
                return Promise.reject(
                    new Error(
                        "字节跳动小程序未提供原生的获取父元素的方法，需要模拟实现，模拟过程的必要条件是：将传递给Page和Component函数的参数先经由MpKit.Page，MpKit.Component加工后再进行传递。"
                    )
                );
            }
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error("timeout"));
                }, 1 * 60 * 1000);
                let count = 0;
                const query = () => {
                    setTimeout(
                        () => {
                            const pageKey = getMpComponentPageNativeViewId(
                                componentView
                            );
                            if (pageKey && ViewInstanceList.Page[pageKey]) {
                                return resolve(ViewInstanceList.Page[pageKey]);
                            }
                            query();
                        },
                        count ? 500 : 0
                    );
                };
                query();
            });
        }
    }
};
export const getChildrenView = (view: MpView): Promise<MpView[]> => {};
