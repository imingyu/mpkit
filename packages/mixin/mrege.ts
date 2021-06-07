import { isNativeFunc, isPromise, uuid, isFunc } from "@mpkit/util";
import {
    MpMethodHook,
    MpViewType,
    MpPlatform,
    MkReplaceFuncCallback,
} from "@mpkit/types";
import { fireViewMethod, formatViewSpecList, hookViewMethod } from "./view";
import {
    FormatApiMethodCallbackHook,
    hookApiMethod,
    hookApiMethodCallback,
} from "./api";
import { createFuncGeneralHook, FuncIDHook } from "./hook";

export const mergeMethod = (
    methodHook,
    methodName,
    methodValues,
    allowStr = false,
    replaceCallback?: MkReplaceFuncCallback
) => {
    function MethodOriginal(...args) {
        return fireViewMethod.apply(this, [methodValues, allowStr, ...args]);
    }

    return hookViewMethod(methodName, MethodOriginal, replaceCallback, [
        FuncIDHook,
        createFuncGeneralHook(methodHook),
    ]);
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
                if (!val) {
                    result[prop].type = val;
                    result[prop].value = val;
                } else {
                    if (val && "type" in val) {
                        result[prop].type = val.type;
                    }
                    if (val && "value" in val) {
                        result[prop].value = val.value;
                    }
                    val && val.observer && observer[prop].push(val.observer);
                }
            } else {
                result[prop].value = val;
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
    const fullSpec = formatViewSpecList(viewType, platform, ...specList);
    if (fullSpec.specialProps) {
        if (fullSpec.specialProps.properties) {
            result["properties"] = mergeProperties(
                methodHook,
                fullSpec.specialProps.properties
            );
        }
        if (fullSpec.specialProps.pageLifetimes) {
            mergeSpecialProps(
                "pageLifetimes",
                fullSpec.specialProps.pageLifetimes,
                methodHook,
                platform,
                result
            );
        }
        if (fullSpec.specialProps.methods) {
            mergeSpecialProps(
                "methods",
                fullSpec.specialProps.methods,
                methodHook,
                platform,
                result
            );
        }
        if (fullSpec.specialProps.lifetimes) {
            mergeSpecialProps(
                "lifetimes",
                fullSpec.specialProps.lifetimes,
                methodHook,
                platform,
                result,
                fullSpec.methodMap
            );
        }
        delete fullSpec.specialProps;
    }
    if (fullSpec.methodMap) {
        hookMethod(methodHook, fullSpec.methodMap, result);
        delete fullSpec.methodMap;
    }
    Object.assign(result, fullSpec);
    return result;
};

export const mergeApi = (
    api: any,
    methodHook?: MpMethodHook[],
    methodReplaceCallback?: MkReplaceFuncCallback
) => {
    const result = {};
    for (let prop in api) {
        if (isFunc(api[prop])) {
            const methodName = prop;
            const methodHandler = api[prop];
            result[prop] = hookApiMethod(
                methodName,
                methodHandler,
                (store) => {
                    methodReplaceCallback && methodReplaceCallback(store);
                },
                [
                    FuncIDHook,
                    FormatApiMethodCallbackHook,
                    createFuncGeneralHook(methodHook),
                ]
            );
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
            hookApiMethodCallback(
                apiName,
                (...args) => {
                    if (args.length < 2) {
                        resolve(args[0]);
                    } else {
                        resolve(args);
                    }
                },
                (...args) => {
                    const err = new Error("未知错误");
                    if (args.length < 2 && args[0] && args[0].errMsg) {
                        err.message = args[0].errMsg;
                    }
                    err["failResult"] = args;
                    reject(err);
                },
                apiArgs
            );
            if (apiName.indexOf("Sync") === -1) {
                let apiOptions = apiArgs[0];
                const res = apiVar[apiName].call(apiVar, apiOptions);
                if (res && apiOptions && isFunc(apiOptions.result)) {
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
