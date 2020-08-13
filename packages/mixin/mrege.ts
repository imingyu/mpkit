import { isNativeFunc, isPlainObject, isPromise, uuid } from "@mpkit/util";
import { MpMethodHook } from "@mpkit/types";

const execHook = (methodHook, vm, step, ...hookArgs): boolean => {
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
export const mergeView = (methodHook: MpMethodHook[], ...specList) => {
    const result = {};
    const methodMap = {};
    const methodsSpecList = [];
    const lifesSpecList = [];
    const pageLifesSpecList = [];
    specList.forEach((spec) => {
        for (let prop in spec) {
            if (Array.isArray(spec) && prop === "length") {
                return;
            }
            const value = spec[prop];
            const valType = typeof value;
            if (valType === "object" && value && isPlainObject(value)) {
                if (prop === "methods") {
                    methodsSpecList.push(value);
                } else if (prop === "lifetimes") {
                    lifesSpecList.push(value);
                } else if (prop === "pageLifetimes") {
                    pageLifesSpecList.push(value);
                } else {
                    if (typeof result[prop] !== "object") {
                        result[prop] = Array.isArray(value) ? [] : {};
                    }
                    result[prop] = mergeView(methodHook, result[prop], value);
                }
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
        }
    });
    lifesSpecList.length &&
        lifesSpecList.forEach((spec) => {
            for (let prop in spec) {
                if (methodMap[prop]) {
                    methodMap[prop].push(spec[prop]);
                } else {
                    methodMap[prop] = [];
                    methodMap[prop].push(spec[prop]);
                }
                delete spec[prop];
            }
        });
    if (methodsSpecList.length) {
        result["methods"] = mergeView(methodHook, ...methodsSpecList);
    }
    if (pageLifesSpecList.length) {
        result["pageLifetimes"] = mergeView(methodHook, ...pageLifesSpecList);
    }
    const hookMethod = (map, target) => {
        for (let methodName in map) {
            const methodValues = map[methodName];
            target[methodName] = function (...args) {
                try {
                    if (
                        execHook(
                            methodHook,
                            this,
                            "before",
                            methodName,
                            args
                        ) !== false
                    ) {
                        let methodResult;
                        methodValues.forEach((item) => {
                            const itemType = typeof item;
                            let hasExec;
                            if (itemType === "function") {
                                methodResult = item.apply(this, args);
                                hasExec = true;
                            } else if (
                                itemType === "string" &&
                                this[item] &&
                                typeof this[item] === "function"
                            ) {
                                methodResult = this[item].apply(this, args);
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
                                        "PromiseReject"
                                    );
                                });
                        });
                        execHook(
                            methodHook,
                            this,
                            "after",
                            methodName,
                            args,
                            methodResult
                        );
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
        }
    };
    hookMethod(methodMap, result);

    return result;
};

export const mergeApi = (api: any, methodHook?: MpMethodHook[]) => {
    const result = {};
    for (let prop in api) {
        if (typeof api[prop] === "function") {
            const methodName = prop;
            const methodHandler = api[prop];
            api[prop] = function (...args) {
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
    return result;
};
