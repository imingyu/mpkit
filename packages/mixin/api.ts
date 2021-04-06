import { hookFunc, replaceFunc } from "@mpkit/func-helper";
import { MkFuncHook, MkReplaceFuncCallback } from "@mpkit/types";

export const FormatApiMethodCallbackHook: MkFuncHook = {
    before(state) {
        hookApiMethodCallback(
            state.state.funcName,
            (res) => {
                state.doneCallback(null, res);
            },
            (res) => {
                state.doneCallback(res);
            },
            state.args
        );
        if (state.args[0] && state.args[0].success) {
            state.needDoneCallback = true;
        }
    },
};

export const hookApiMethodCallback = (
    apiName: string,
    onSuccess: Function,
    onFail: Function,
    args: any[]
) => {
    if (!apiName.endsWith("Sync") && (!args.length || args[0] === null)) {
        args[0] = {};
    }
    if (typeof args[0] === "object" && args[0]) {
        const { success, fail } = args[0];
        args[0].success = function HookApiSuccessCallback(...params) {
            onSuccess(...params);
            return success && success.apply(this, params);
        };
        args[0].fail = function HookApiFailCallback(...params) {
            onFail(...params);
            return fail && fail.apply(this, params);
        };
    }
    return args;
};

export const hookApiMethod = (
    apiName: string,
    apiMethod: Function,
    replaceCallback: MkReplaceFuncCallback,
    hooks: MkFuncHook[]
) => {
    return replaceFunc(
        apiMethod,
        hookFunc(apiMethod, false, hooks, {
            funcName: apiName,
        }).func,
        replaceCallback,
        {
            funcName: apiName,
        }
    );
};
