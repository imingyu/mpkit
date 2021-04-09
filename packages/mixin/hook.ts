import { MkFuncHook, MkFuncHookState, MpMethodHook } from "@mpkit/types";
import { uuid } from "@mpkit/util";

export const execHook = (
    methodHook: MpMethodHook[],
    vm,
    step,
    ...hookArgs
): boolean => {
    if (!methodHook || !methodHook.length) {
        return;
    }
    const methodName = hookArgs[0];
    let res;
    methodHook.forEach((item) => {
        if (res !== false) {
            const oldRes = res;
            res =
                item &&
                item[step] &&
                (item[step] as Function).apply(vm, hookArgs);
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

export const FuncIDHook: MkFuncHook = {
    before(state) {
        state.state.id = uuid();
    },
};

const fireFuncHook = (
    methodHook: MpMethodHook[],
    step: string,
    state: MkFuncHookState
) => {
    const args = [
        methodHook,
        state.ctx,
        step,
        state.state.funcName,
        state.args,
    ];
    if (step === "before") {
        args.push(state.func);
    } else if (step === "after") {
        args.push(state.result);
    } else if (step === "complete") {
        if (state.fulfilled) {
            args.push(state.value, true);
        } else {
            args.push(
                state.errors && state.errors[state.errors.length - 1]
                    ? state.errors[state.errors.length - 1].error
                    : null,
                false
            );
        }
    } else if (step === "catch") {
        args.push(
            state.errors && state.errors[state.errors.length - 1]
                ? state.errors[state.errors.length - 1].error
                : null
        );
    }
    args.push(state.state.id);
    const hookResult = execHook.apply(null, args);
    if (hookResult === false) {
        state.stop = true;
    } else if (
        step === "before" &&
        hookResult !== true &&
        typeof hookResult !== "undefined"
    ) {
        state.stop = true;
        state.result = hookResult;
    }
    return hookResult;
};

export const createFuncGeneralHook = (
    methodHook: MpMethodHook[]
): MkFuncHook => {
    return {
        before(state) {
            return fireFuncHook(methodHook, "before", state);
        },
        after(state) {
            return fireFuncHook(methodHook, "after", state);
        },
        complete(state) {
            return fireFuncHook(methodHook, "complete", state);
        },
        catch(state) {
            return fireFuncHook(methodHook, "catch", state);
        },
    };
};
