import { MpPlatfrom } from "@mpkit/types";
import {
    MpViewType,
    MpView,
    MpTiktokView,
    MpAlipayViewComponent,
    MpAlipayViewPage,
    MpWechatView,
    MpSmartViewPage,
    MpSmartViewComponent,
} from "@mpkit/types";
export const uuid = () => {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        // tslint:disable-next-line:no-bitwise
        var r = (Math.random() * 16) | 0;
        // tslint:disable-next-line:no-bitwise
        var v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const isNativeFunc = (func: Function) => {
    return func === Function || func.toString().indexOf("[native code]") !== -1;
};

export function isPlainObject(value) {
    if (typeof value !== "object") {
        return false;
    }
    if (Object.getPrototypeOf(value) === null) {
        return true;
    }
    let proto = value;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(value) === proto;
}
export const isEmptyObject = (obj) => {
    for (let prop in obj) {
        return false;
    }
    return true;
};
export const isPromise = (obj) => obj && obj.then;
export const getMpPlatform = (() => {
    let platform;
    return (): MpPlatfrom => {
        if (platform) {
            return platform as MpPlatfrom;
        }
        const check = (obj, prop?: string) => {
            const isObj = typeof obj === "object";
            if (isObj && obj) {
                if (
                    obj.self &&
                    obj.self === obj &&
                    typeof obj[prop] === "object" &&
                    obj[prop]
                ) {
                    return true;
                }
                return true;
            }
        };
        if (check(wx) || check(window, "wx")) {
            return (platform = MpPlatfrom.wechat);
        }
        if (check(my) || check(window, "my")) {
            return (platform = MpPlatfrom.alipay);
        }
        if (check(swan) || check(window, "swan")) {
            return (platform = MpPlatfrom.smart);
        }
        if (check(tt) || check(window, "tt")) {
            return (platform = MpPlatfrom.tiktok);
        }
        return (platform = MpPlatfrom.unknown);
    };
})();

export const getApiVar = (() => {
    let result;
    return () => {
        if (result) {
            return result;
        }
        const check = (obj, prop?: string) => {
            const isObj = typeof obj === "object";
            if (isObj && obj) {
                if (
                    obj.self &&
                    obj.self === obj &&
                    typeof obj[prop] === "object" &&
                    obj[prop]
                ) {
                    return true;
                }
                return true;
            }
        };
        if (check(wx) || check(window, "wx")) {
            return (result = wx);
        }
        if (check(my) || check(window, "my")) {
            return (result = my);
        }
        if (check(swan) || check(window, "swan")) {
            return (result = swan);
        }
        if (check(tt) || check(window, "tt")) {
            return (result = tt);
        }
        return (result = {});
    };
})();

export const getMpInitLifeName = (viewType: MpViewType) => {
    if (viewType === MpViewType.App) {
        return "onLaunch";
    }
    if (viewType === MpViewType.Page) {
        return "onLoad";
    }
    if (viewType === MpViewType.Component) {
        const mpPlatform = getMpPlatform();
        return mpPlatform !== MpPlatfrom.alipay ? "created" : "onInit";
    }
};
export const getMpMountLifeName = (viewType: MpViewType) => {
    if (viewType === MpViewType.App) {
        return "onShow";
    }
    if (viewType === MpViewType.Page) {
        return "onShow";
    }
    if (viewType === MpViewType.Component) {
        const mpPlatform = getMpPlatform();
        return mpPlatform !== MpPlatfrom.alipay ? "attached" : "didMount";
    }
};

export const initView = (view: MpView, viewType: MpViewType) => {
    defineViewType(view, viewType);
    defineViewKey(view);
};

const defineViewKey = (view: MpView) => {
    if (!view.$mkKeyIsDefine) {
        const MP_PLATFORM = getMpPlatform();
        view.$mkKeyIsDefine = MP_PLATFORM === MpPlatfrom.smart ? uuid() : true;
        Object.defineProperty(view, "$mkKey", {
            get() {
                return getMpNativeViewId(this, getMpViewType(this));
            },
        });
    }
};
const defineViewType = (view: MpView, value: MpViewType) => {
    if (!view.$mkType) {
        Object.defineProperty(view, "$mkType", {
            value,
        });
    }
    return value;
};

export const getMpViewType = (view: MpView): MpViewType => {
    if (!view.$mkType) {
        if ("route" in view || "__route__" in view) {
            return defineViewType(view, MpViewType.Page);
        }
        if ("triggerEvent" in view) {
            return defineViewType(view, MpViewType.Component);
        }
        if ("props" in view && getMpPlatform() === MpPlatfrom.alipay) {
            return defineViewType(view, MpViewType.Component);
        }
        if (typeof getApp === "function" && getApp() === view) {
            return defineViewType(view, MpViewType.App);
        }
        return defineViewType(view, MpViewType.Page);
    }
    return view.$mkType;
};

export const getMpNativeViewId = (
    vm: MpView,
    viewType?: MpViewType
): string => {
    if (!viewType) {
        viewType = getMpViewType(vm);
    }
    const MP_PLATFORM = getMpPlatform();
    if (MP_PLATFORM === MpPlatfrom.unknown) {
        return "unknown";
    }
    if (viewType === MpViewType.App) {
        return "app";
    }
    if (viewType === MpViewType.Page) {
        if (MP_PLATFORM === MpPlatfrom.wechat) {
            return (vm as MpWechatView).__wxWebviewId__ + "";
        }
        if (MP_PLATFORM === MpPlatfrom.alipay) {
            return (vm as MpAlipayViewPage).$viewId;
        }
        if (MP_PLATFORM === MpPlatfrom.tiktok) {
            return (vm as MpTiktokView).__webviewId__ + "";
        }
        if (MP_PLATFORM === MpPlatfrom.smart) {
            defineViewKey(vm);
            return (vm as MpSmartViewPage).$mkKey;
        }
    }
    if (viewType === MpViewType.Component) {
        if (MP_PLATFORM === MpPlatfrom.wechat) {
            return (vm as MpWechatView).__wxExparserNodeId__;
        }
        if (MP_PLATFORM === MpPlatfrom.alipay) {
            return (vm as MpAlipayViewComponent).$id + "";
        }
        if (MP_PLATFORM === MpPlatfrom.tiktok) {
            return (vm as MpTiktokView).__nodeId__ + "";
        }
        if (MP_PLATFORM === MpPlatfrom.smart) {
            return (vm as MpSmartViewComponent).nodeId;
        }
    }
};
export const getMpComponentPageNativeViewId = (vm: MpView): string => {
    const MP_PLATFORM = getMpPlatform();
    if (MP_PLATFORM === MpPlatfrom.wechat) {
        return (vm as MpWechatView).__wxWebviewId__ + "";
    }
    if (MP_PLATFORM === MpPlatfrom.alipay) {
        return getMpNativeViewId((vm as MpAlipayViewComponent).$page);
    }
    if (MP_PLATFORM === MpPlatfrom.tiktok) {
        return (vm as MpTiktokView).__webviewId__ + "";
    }
    if (MP_PLATFORM === MpPlatfrom.smart) {
        return getMpNativeViewId((vm as MpSmartViewComponent).pageinstance);
    }
};
export const getMpViewPathName = (
    viewType: MpViewType,
    vm?: MpView
): string => {
    if (viewType === MpViewType.App) {
        return "app";
    }
    if (!vm) {
        return "";
    }
    const MP_PLATFORM = getMpPlatform();
    if (MP_PLATFORM === MpPlatfrom.wechat) {
        return (vm as MpWechatView).is;
    }
    if (MP_PLATFORM === MpPlatfrom.alipay) {
        if (viewType === MpViewType.Page) {
            return (vm as MpAlipayViewPage).route;
        }
        return (vm as MpAlipayViewComponent).is;
    }
    if (MP_PLATFORM === MpPlatfrom.tiktok) {
        return (vm as MpTiktokView).is;
    }
    if (MP_PLATFORM === MpPlatfrom.smart) {
        if (viewType === MpViewType.Page) {
            return (vm as MpSmartViewPage).route;
        }
        return (vm as MpSmartViewComponent).is;
    }
};
