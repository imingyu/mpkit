import {
    isNativeFunc,
    isPlainObject,
    isPromise,
    uuid,
    merge,
    isFunc,
} from "@mpkit/util";
import { MpMethodHook, MpViewType, MpPlatform } from "@mpkit/types";

export const execHook = (methodHook, vm, step, ...hookArgs): boolean => {
    if (!methodHook || !methodHook.length) {
        return;
    }
    const methodName = hookArgs[0];
    let res;
    methodHook.forEach((item) => {
        if (res !== false) {
            const oldRes = res;
            res = item && item[step] && item[step].apply(vm, hookArgs);
            res = typeof res === "undefined" ? oldRes : res;
        }
        if (res !== false) {
            const oldRes = res;
            res =
                item &&
                item[methodName] &&
                item[methodName][step] &&
                item[methodName][step].apply(vm, hookArgs);
            res = typeof res === "undefined" ? oldRes : res;
        }
    });
    return res;
};
export const mergeMethod = (
    methodHook,
    methodName,
    methodValues,
    allowStr = false
) => {
    return function (...args) {
        const funId = uuid();
        try {
            if (
                execHook(
                    methodHook,
                    this,
                    "before",
                    methodName,
                    args,
                    methodValues,
                    funId
                ) !== false
            ) {
                let methodResult;
                methodValues.forEach((item) => {
                    const itemType = typeof item;
                    let hasExec;
                    if (itemType === "function") {
                        const res = item.apply(this, args);
                        if (typeof res !== "undefined") {
                            methodResult = res;
                        }
                        hasExec = true;
                    } else if (
                        itemType === "string" &&
                        allowStr &&
                        this[item] &&
                        isFunc(this[item])
                    ) {
                        const res = this[item].apply(this, args);
                        if (typeof res !== "undefined") {
                            methodResult = res;
                        }
                        hasExec = true;
                    }
                    hasExec &&
                        isPromise(methodResult) &&
                        methodResult.catch((error) => {
                            execHook(
                                methodHook,
                                this,
                                "catch",
                                methodName,
                                args,
                                error,
                                "PromiseReject",
                                funId
                            );
                        });
                });
                execHook(
                    methodHook,
                    this,
                    "after",
                    methodName,
                    args,
                    methodResult,
                    funId
                );
                return methodResult;
            }
        } catch (error) {
            execHook(
                methodHook,
                this,
                "catch",
                methodName,
                args,
                error,
                "MethodError",
                funId
            );
            throw error;
        }
    };
};
const hookMethod = (methodHook, map, target, allowStr = false) => {
    for (let methodName in map) {
        const methodValues = map[methodName];
        if (methodValues.length) {
            target[methodName] = mergeMethod(
                methodHook,
                methodName,
                methodValues,
                allowStr
            );
            target[methodName].displayName = methodName;
        }
    }
};
const mergeProperties = (methodHook, properties) => {
    const result = {};
    const observer = {};
    properties.forEach((item) => {
        for (let prop in item) {
            if (!result[prop]) {
                result[prop] = {};
            }
            if (!observer[prop]) {
                observer[prop] = [];
            }
            const val = item[prop];
            if (isNativeFunc(val)) {
                result[prop].type = val;
            } else if (typeof val === "object") {
                result[prop].type = val.type || result[prop].type;
                val.observer && observer[prop].push(val.observer);
            }
        }
    });
    for (let prop in result) {
        if (observer[prop] && observer[prop].length) {
            result[prop].observer = mergeMethod(
                methodHook,
                "observer",
                observer[prop]
            );
        }
    }
    return result;
};

const mergeSpecialProps = (
    prop,
    values,
    methodHook,
    paltform,
    target,
    removeMap = null
) => {
    if (values.length) {
        const subMethodMap = {};
        values.forEach((item) => {
            Object.keys(item).forEach((key) => {
                if (prop === "lifetimes" && removeMap && removeMap[key]) {
                    // lifetimes内声明的函数优先级比直接声明的created等要高，会被覆盖
                    // https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/framework/custom-component/component-constructor
                    // https://smartprogram.baidu.com/docs/develop/framework/custom-component_comp/
                    // https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html
                    delete removeMap[key];
                }
                if (!subMethodMap[key]) {
                    subMethodMap[key] = [];
                }
                subMethodMap[key].push(item[key]);
            });
        });
        target[prop] = {};
        hookMethod(
            methodHook,
            subMethodMap,
            target[prop],
            prop === "lifetimes" && paltform === MpPlatform.wechat
        );
    }
};

export const mergeView = (
    viewType: MpViewType,
    platform: MpPlatform,
    methodHook: MpMethodHook[],
    ...specList
): any => {
    const result = {};
    let specialProps = {};
    const methodMap = {};
    let hasSpecial;
    if (viewType === MpViewType.Component) {
        if (
            platform === MpPlatform.wechat ||
            platform === MpPlatform.smart ||
            platform === MpPlatform.tiktok
        ) {
            hasSpecial = true;
            merge(specialProps, {
                properties: [],
                methods: [],
                lifetimes: [],
                pageLifetimes: [],
            });
        } else if (platform === MpPlatform.alipay) {
            hasSpecial = true;
            merge(specialProps, {
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
    if (hasSpecial) {
        if (specialProps["properties"] && specialProps["properties"].length) {
            result["properties"] = mergeProperties(
                methodHook,
                specialProps["properties"]
            );
        }
        if (
            specialProps["pageLifetimes"] &&
            specialProps["pageLifetimes"].length
        ) {
            mergeSpecialProps(
                "pageLifetimes",
                specialProps["pageLifetimes"],
                methodHook,
                platform,
                result
            );
        }
        if (specialProps["methods"] && specialProps["methods"].length) {
            mergeSpecialProps(
                "methods",
                specialProps["methods"],
                methodHook,
                platform,
                result
            );
        }
        if (specialProps["lifetimes"] && specialProps["lifetimes"].length) {
            mergeSpecialProps(
                "lifetimes",
                specialProps["lifetimes"],
                methodHook,
                platform,
                result,
                methodMap
            );
        }
    }
    hookMethod(methodHook, methodMap, result);
    return result;
};

export const mergeApi = (api: any, methodHook?: MpMethodHook[]) => {
    const result = {};
    for (let prop in api) {
        if (isFunc(api[prop])) {
            const methodName = prop;
            const methodHandler = api[prop];
            result[prop] = function (...args) {
                try {
                    const funId = uuid();
                    if (methodName.indexOf("Sync") === -1 && !args.length) {
                        args[0] = {};
                    }
                    if (typeof args[0] === "object" && args[0]) {
                        const { success, fail } = args[0];
                        args[0].success = (...params) => {
                            success && success.apply(null, params);
                            execHook(
                                methodHook,
                                this,
                                "complete",
                                methodName,
                                args,
                                params.length <= 1 ? params[0] : params,
                                true,
                                funId
                            );
                        };
                        args[0].fail = (...params) => {
                            fail && fail.apply(null, params);
                            execHook(
                                methodHook,
                                this,
                                "complete",
                                methodName,
                                args,
                                params.length <= 1 ? params[0] : params,
                                false,
                                funId
                            );
                        };
                    }
                    const beforeResult = execHook(
                        methodHook,
                        this,
                        "before",
                        methodName,
                        args,
                        methodHandler,
                        funId
                    );
                    if (beforeResult !== false) {
                        if (
                            beforeResult !== true &&
                            typeof beforeResult !== "undefined"
                        ) {
                            return beforeResult;
                        }
                        const res = methodHandler.apply(this, args);
                        execHook(
                            methodHook,
                            this,
                            "after",
                            methodName,
                            args,
                            res,
                            funId
                        );
                        return res;
                    }
                } catch (error) {
                    execHook(
                        methodHook,
                        this,
                        "catch",
                        methodName,
                        args,
                        error
                    );
                    throw error;
                }
            };
        } else {
            result[prop] = api[prop];
        }
    }
    result["promiseify"] = function (apiName: string, ...apiArgs: any[]) {
        return promiseifyApi.apply(this, [this, apiName, ...apiArgs]);
    };
    return result;
};

export const promiseifyApi = (
    apiVar: any,
    apiName: string,
    ...apiArgs: any[]
): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (isFunc(apiVar[apiName])) {
            if (apiName.indexOf("Sync") === -1) {
                let apiOptions = apiArgs[0];
                const type = typeof apiOptions;
                if (type !== "object" || !type) {
                    apiOptions = {};
                }
                const { success, fail } = apiOptions;
                apiOptions.success = function (...args) {
                    if (args.length < 2) {
                        resolve(args[0]);
                    } else {
                        resolve(args);
                    }
                    return success.apply(this, args);
                };
                apiOptions.fail = function (...args) {
                    const err = new Error("未知错误");
                    if (args.length < 2 && args[0] && args[0].errMsg) {
                        err.message = args[0].errMsg;
                    }
                    err["failResult"] = args;
                    reject(err);
                    return fail.apply(this, args);
                };
                const res = apiVar[apiName].call(apiVar, apiOptions);
                if (res && isFunc(apiOptions)) {
                    apiOptions.result(res);
                }
            } else {
                try {
                    const res = apiVar[apiName].call(apiVar, apiArgs);
                    resolve(res);
                } catch (error) {
                    reject(error);
                }
            }
        } else {
            resolve(apiVar[apiName]);
        }
    });
};
