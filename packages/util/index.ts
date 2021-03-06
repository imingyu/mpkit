import {
    MpPlatform,
    MpViewInitLifes,
    MpViewMountLifes,
    MkMaybe,
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
    return (
        func === Function ||
        (typeof func === "function" &&
            func.toString().indexOf("[native code]") !== -1)
    );
};

export const isFunc = (obj) => typeof obj === "function";

export const isPromise = (obj) => obj && obj.then;
export const getMpPlatform = (() => {
    let platform;
    return (): MpPlatform => {
        if (platform) {
            return platform as MpPlatform;
        }
        if (typeof wx === "object") {
            return (platform = MpPlatform.wechat);
        }
        if (typeof my === "object") {
            return (platform = MpPlatform.alipay);
        }
        if (typeof swan === "object") {
            return (platform = MpPlatform.smart);
        }
        if (typeof tt === "object") {
            return (platform = MpPlatform.tiktok);
        }
        return (platform = MpPlatform.unknown);
    };
})();

export const getApiVar = () => {
    const platform = getMpPlatform();
    if (platform === MpPlatform.wechat && typeof wx === "object") {
        return wx;
    } else if (platform === MpPlatform.alipay && typeof my === "object") {
        return my;
    } else if (platform === MpPlatform.smart && typeof swan === "object") {
        return swan;
    } else if (platform === MpPlatform.tiktok && typeof tt === "object") {
        return tt;
    }
};

export const getMpInitLifeName = (viewType: MpViewType): MpViewInitLifes => {
    if (viewType === MpViewType.App) {
        return "onLaunch";
    }
    if (viewType === MpViewType.Page) {
        return "onLoad";
    }
    if (viewType === MpViewType.Component) {
        const mpPlatform = getMpPlatform();
        return mpPlatform !== MpPlatform.alipay ? "created" : "onInit";
    }
};
export const getMpMountLifeName = (viewType: MpViewType): MpViewMountLifes => {
    if (viewType === MpViewType.App) {
        return "onShow";
    }
    if (viewType === MpViewType.Page) {
        return "onShow";
    }
    if (viewType === MpViewType.Component) {
        const mpPlatform = getMpPlatform();
        return mpPlatform !== MpPlatform.alipay ? "attached" : "didMount";
    }
};

export const initView = (view: MpView, viewType: MpViewType) => {
    defineViewType(view, viewType);
    defineViewKey(view);
};

const defineViewKey = (view: MpView) => {
    if (!view.$mkKeyIsDefine) {
        view.$mkKeyIsDefine = uuid();
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

export const getMpViewType = (view: MpView): MkMaybe<MpViewType> => {
    if (getMpPlatform() === MpPlatform.unknown) {
        return;
    }
    if (!view.$mkType) {
        if ("route" in view || "__route__" in view) {
            return defineViewType(view, MpViewType.Page);
        }
        if ("triggerEvent" in view) {
            return defineViewType(view, MpViewType.Component);
        }
        if ("props" in view && getMpPlatform() === MpPlatform.alipay) {
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
): MkMaybe<string> => {
    if (!viewType) {
        const tsViewType = getMpViewType(vm);
        if (tsViewType) {
            viewType = tsViewType;
        }
    }
    if (!viewType) {
        return;
    }
    const MP_PLATFORM = getMpPlatform();
    if (MP_PLATFORM === MpPlatform.unknown) {
        return "unknown";
    }
    if (viewType === MpViewType.App) {
        return "app";
    }
    if (viewType === MpViewType.Page) {
        if (MP_PLATFORM === MpPlatform.wechat) {
            return (vm as MpWechatView).__wxWebviewId__ + "";
        }
        if (MP_PLATFORM === MpPlatform.alipay) {
            return (vm as MpAlipayViewPage).$viewId;
        }
        if (MP_PLATFORM === MpPlatform.tiktok) {
            return (vm as MpTiktokView).__webviewId__ + "";
        }
        if (MP_PLATFORM === MpPlatform.smart) {
            defineViewKey(vm);
            return (vm as MpSmartViewPage).$mkKey;
        }
    }
    if (viewType === MpViewType.Component) {
        if (MP_PLATFORM === MpPlatform.wechat) {
            return (vm as MpWechatView).$mkKeyIsDefine;
        }
        if (MP_PLATFORM === MpPlatform.alipay) {
            return (vm as MpAlipayViewComponent).$id + "";
        }
        if (MP_PLATFORM === MpPlatform.tiktok) {
            return (vm as MpTiktokView).__nodeId__ + "";
        }
        if (MP_PLATFORM === MpPlatform.smart) {
            return (vm as MpSmartViewComponent).nodeId;
        }
    }
};
export const getMpComponentPageNativeViewId = (vm: MpView): MkMaybe<string> => {
    const MP_PLATFORM = getMpPlatform();
    if (MP_PLATFORM === MpPlatform.wechat) {
        return (vm as MpWechatView).__wxWebviewId__ + "";
    }
    if (MP_PLATFORM === MpPlatform.alipay) {
        return getMpNativeViewId((vm as MpAlipayViewComponent).$page);
    }
    if (MP_PLATFORM === MpPlatform.tiktok) {
        return (vm as MpTiktokView).__webviewId__ + "";
    }
    if (MP_PLATFORM === MpPlatform.smart) {
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
    if (MP_PLATFORM === MpPlatform.wechat) {
        return (vm as MpWechatView).is;
    }
    if (MP_PLATFORM === MpPlatform.alipay) {
        if (viewType === MpViewType.Page) {
            return (vm as MpAlipayViewPage).route;
        }
        return (vm as MpAlipayViewComponent).is;
    }
    if (MP_PLATFORM === MpPlatform.tiktok) {
        return (vm as MpTiktokView).is;
    }
    if (MP_PLATFORM === MpPlatform.smart) {
        if (viewType === MpViewType.Page) {
            return (vm as MpSmartViewPage).route;
        }
        return (vm as MpSmartViewComponent).is;
    }
};

export const isMpIvew = (view: any): boolean => {
    if (typeof view === "object" && view && !isPlainObject(view)) {
        if (view.$mkType) {
            return true;
        }
        if (getMpViewType(view)) {
            return true;
        }
    }
    return false;
};

export const clone = (obj) => {
    const type = typeof obj;
    if (type !== "object") {
        return obj;
    } else if (Array.isArray(obj)) {
        const res = [];
        obj.forEach((item, index) => {
            res[index] = clone(item);
        });
        return res;
    } else if (obj && isPlainObject(obj)) {
        return Object.keys(obj).reduce((sum, key) => {
            sum[key] = clone(obj[key]);
            return sum;
        }, {});
    } else {
        return obj;
    }
};
export function isPlainObject(value) {
    if (typeof value !== "object") {
        return false;
    }
    if (value == null || Object.getPrototypeOf(value) === null) {
        return true;
    }
    let proto = value;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(value) === proto;
}
export const isEmptyObject = (obj) => {
    if (Array.isArray(obj)) {
        return !obj.length;
    }
    for (let prop in obj) {
        return false;
    }
    return true;
};

export const isUndefined = (obj) => typeof obj === "undefined";

export const merge = (source, ...targets) => {
    if (!isValidObject(source, false)) {
        return source;
    }
    targets.forEach((target) => {
        if (source === target) {
            return;
        }
        if (isValidObject(target)) {
            if (Array.isArray(target) && !Array.isArray(source)) {
                source = [];
            }
            Object.keys(target).forEach((prop) => {
                if (prop === "__proto__") {
                    return;
                }
                const value = target[prop];
                const valType = typeof value;
                if (
                    valType === "object" &&
                    value &&
                    (isPlainObject(value) || Array.isArray(value))
                ) {
                    if (typeof source[prop] !== "object") {
                        source[prop] = Array.isArray(value) ? [] : {};
                    }
                    if (Array.isArray(value) && !value.length) {
                    } else {
                        source[prop] = merge(source[prop], value);
                    }
                } else {
                    source[prop] = value;
                }
            });
        } else if (Array.isArray(target)) {
            if (!likeArray(source)) {
                source = [];
            }
        }
    });
    return source;
};
export const isValidObject = (obj, checkEmpty = true) =>
    typeof obj === "object" && obj && (checkEmpty ? !isEmptyObject(obj) : true);

export const nextCharCount = (
    char: string,
    charIndex: number,
    str: string
): number => {
    let res = 0;
    if (charIndex + 1 >= str.length) {
        return res;
    }
    for (let i = charIndex + 1, len = str.length; i < len; i++) {
        const currentChar = str[i];
        if (currentChar !== char) {
            break;
        }
        res++;
    }
    return res;
};

export const firstAfterCharsIndex = (
    afterIndex: number,
    chars: string,
    str: string
): number => {
    const index = str.substr(afterIndex + 1).indexOf(chars);
    if (index === -1) {
        return index;
    }
    return afterIndex + index;
};

export const reolaceFileSuffix = (fileName: string, suffix: string) => {
    return fileName.substr(0, fileName.lastIndexOf(".")) + suffix;
};

export const likeArray = (obj) =>
    Array.isArray(obj) ||
    (typeof obj === "object" &&
        obj &&
        typeof obj.length === "number" &&
        obj.length);

export const isValidMpPlatform = (platform) => {
    return (
        platform === MpPlatform.wechat ||
        platform === MpPlatform.alipay ||
        platform === MpPlatform.smart ||
        platform === MpPlatform.tiktok
    );
};

// export const like = (a, b) => {
//     if (a === b) {
//         return true;
//     }
//     const typeA = typeof a;
//     const typeB = typeof b;
//     if (typeA !== typeB) {
//         return false;
//     }
//     if (typeA !== "object") {
//         return false;
//     }
//     const arrA = Array.isArray(a);
//     const arrB = Array.isArray(b);
//     if (arrA !== arrB) {
//         return false;
//     }
//     // 数组的情况
//     if (arrA) {
//         if (a.length !== b.length) {
//             return false;
//         }
//         return (a as any[]).every((item, index) => like(item, b[index]));
//     }

//     // 对象的情况
//     const keysA = Object.keys(a);
//     const keysB = Object.keys(b);
//     if (!like(keysA, keysB)) {
//         return false;
//     }
//     return keysA.every((key) => like(a[key], b[key]));
// };
