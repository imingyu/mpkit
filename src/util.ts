import { MpPlatfrom, MpViewType } from "./enum";
export interface TMap<T> {
    [propName: string]: T;
}
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
