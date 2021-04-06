import { hookFunc, replaceFunc } from "@mpkit/func-helper";
import {
    MkFuncHook,
    MkReplaceFuncCallback,
    MkViewFormatSpec,
    MpPlatform,
    MpViewType,
} from "@mpkit/types";
import {
    isEmptyObject,
    isFunc,
    isNativeFunc,
    isPlainObject,
    merge,
} from "@mpkit/util";

export const formatViewSpecList = (
    viewType: MpViewType,
    platform: MpPlatform,
    ...specList
): MkViewFormatSpec => {
    const result: MkViewFormatSpec = {};
    const specialProps: any = {};
    const methodMap: any = {};
    if (viewType === MpViewType.Component) {
        if (
            platform === MpPlatform.wechat ||
            platform === MpPlatform.smart ||
            platform === MpPlatform.tiktok
        ) {
            Object.assign(specialProps, {
                properties: [],
                methods: [],
                lifetimes: [],
                pageLifetimes: [],
            });
        } else if (platform === MpPlatform.alipay) {
            Object.assign(specialProps, {
                methods: [],
            });
        }
    }
    specList.forEach((spec) => {
        Object.keys(spec).forEach((prop) => {
            const value = spec[prop];
            const valType = typeof value;
            if (prop in specialProps && viewType === MpViewType.Component) {
                specialProps[prop].push(value);
            } else if (valType === "object" && value && isPlainObject(value)) {
                if (typeof result[prop] !== "object") {
                    result[prop] = Array.isArray(value) ? [] : {};
                }
                merge(result[prop], value);
            } else if (valType === "function") {
                if (isNativeFunc(value)) {
                    result[prop] = value;
                } else {
                    if (!methodMap[prop]) {
                        methodMap[prop] = [];
                    }
                    methodMap[prop].push(value);
                }
            } else {
                result[prop] = value;
            }
        });
    });
    if (!specialProps.methods || !specialProps.methods.length) {
        delete specialProps.methods;
    }
    if (!specialProps.properties || !specialProps.properties.length) {
        delete specialProps.properties;
    }
    if (!specialProps.lifetimes || !specialProps.lifetimes.length) {
        delete specialProps.lifetimes;
    }
    if (!specialProps.pageLifetimes || !specialProps.pageLifetimes.length) {
        delete specialProps.pageLifetimes;
    }
    if (!isEmptyObject(specialProps)) {
        result.specialProps = specialProps;
    }
    if (!isEmptyObject(methodMap)) {
        result.methodMap = methodMap;
    }
    return result;
};

export const hookViewMethod = (
    name: string,
    method: Function,
    replaceCallback: MkReplaceFuncCallback,
    hooks: MkFuncHook[]
) => {
    return replaceFunc(
        method,
        hookFunc(method, false, hooks, {
            funcName: name,
        }).func,
        replaceCallback,
        {
            funcName: name,
        }
    );
};

export const fireViewMethod = function (
    methodHandlers: Array<Function | string>,
    allowStr: boolean,
    ...args: any[]
) {
    const ctx = this;
    let methodResult;
    methodHandlers.forEach((item) => {
        if (typeof item === "function") {
            const res = item.apply(ctx, args);
            if (typeof res !== "undefined") {
                methodResult = res;
            }
        } else if (
            typeof item === "string" &&
            allowStr &&
            ctx &&
            ctx[item] &&
            isFunc(ctx[item])
        ) {
            const res = ctx[item].apply(this, args);
            if (typeof res !== "undefined") {
                methodResult = res;
            }
        }
    });
    return methodResult;
};
