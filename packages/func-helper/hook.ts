import {
    MkFuncHook,
    MkFuncHookErrorType,
    MkFuncHookHandler,
    MkFuncHookName,
    MkFuncHookResult,
    MkFuncHookState,
} from "@mpkit/types";

/**使用多种钩子钩住函数，并返回处理后的函数 */
export const hookFunc = (() => {
    const isFunc = (item: any) =>
        typeof item === "function" ||
        (Array.isArray(item) &&
            (item as any[]).some((it) => typeof it === "function"));
    const hookNames = ["before", "after", "catch", "complete", "done"];
    return <T extends Function = Function, S = any>(
        func: T,
        hooksInvariant: boolean,
        hooks: MkFuncHook<S>[],
        otherState?: any
    ): MkFuncHookResult => {
        let enabled: any = {
            before: 1,
            after: 1,
            catch: 1,
            complete: 1,
            done: 1,
        };
        const has: any = {};

        const hasHook = (name: MkFuncHookName): boolean => {
            if (!hooksInvariant) {
                // 如果hooks不是恒定的，则需要每次动态查询
                return hooks.some((item) => item && isFunc(item[name]));
            }
            if (!(name in has)) {
                hooks.forEach((item) => {
                    if (!item) {
                        return;
                    }
                    hookNames.forEach((n) => {
                        if (isFunc(item[n])) {
                            has[n] = 1;
                        }
                    });
                });
                hookNames.forEach((n) => {
                    if (!(n in has)) {
                        has[n] = 0;
                    }
                });
            }
            return has[name];
        };
        const targetFunc = (function HookFunction(...args) {
            const ctx = this;
            const state: MkFuncHookState<S> = {
                ctx,
                func,
                args,
                state: {} as S,
                stepResultList: [],
                doneCallback(err: Error, res?: any): any {
                    if (state.done) {
                        return;
                    }
                    if (err) {
                        state.fulfilled = false;
                    } else {
                        state.value = res;
                        state.fulfilled = true;
                    }
                    fireHook("complete");
                    checkFireDone("callback");
                },
            };
            if (otherState) {
                Object.assign(state.state, otherState);
            }

            const fireHook = (name: MkFuncHookName) => {
                if (name !== "done" && name !== "catch" && state.stop) {
                    return;
                }
                let needExec = !enabled[name]
                    ? false
                    : hooksInvariant
                    ? hasHook(name)
                    : true;
                if (needExec) {
                    try {
                        for (let i = 0, len = hooks.length; i < len; i++) {
                            const hook = hooks[i];
                            if (hook && hook[name]) {
                                if (Array.isArray(hook[name])) {
                                    const list = hook[
                                        name
                                    ] as MkFuncHookHandler<S>[];
                                    for (
                                        let j = 0, lj = list.length;
                                        j < lj;
                                        j++
                                    ) {
                                        state.stepResultList.push({
                                            step: name,
                                            result: list[j]
                                                ? list[j](state)
                                                : undefined,
                                        });
                                        if (
                                            name !== "done" &&
                                            name !== "catch" &&
                                            state.stop
                                        ) {
                                            break;
                                        }
                                    }
                                } else {
                                    state.stepResultList.push({
                                        step: name,
                                        result: (hook[
                                            name
                                        ] as MkFuncHookHandler<S>)(state),
                                    });
                                }
                            }
                            if (
                                name !== "done" &&
                                name !== "catch" &&
                                state.stop
                            ) {
                                break;
                            }
                        }
                    } catch (e) {
                        const type = `${name[0].toUpperCase()}${name.substr(
                            1
                        )}Exception` as MkFuncHookErrorType;
                        if (name !== "catch") {
                            fireCatch(type, e);
                        } else {
                            state.errors.push({
                                type,
                                error: e,
                            });
                        }
                    }
                }
            };
            const fireCatch = (type: MkFuncHookErrorType, error) => {
                if (!state.errors) {
                    state.errors = [];
                }
                state.errors.push({
                    type,
                    error,
                });
                if (hasHook("catch")) {
                    try {
                        fireHook("catch");
                    } catch (e) {
                        state.errors.push({
                            type: "CatchException",
                            error: e,
                        });
                    }
                }
            };
            const doneStep: any = {};
            const checkFireDone = (step: string) => {
                doneStep[step] = 1;
                const isPromise =
                    typeof state.result === "object" &&
                    state.result &&
                    (state.result.then || state.result.catch);
                if (state.needDoneCallback && isPromise) {
                    if (doneStep.promise && doneStep.callback) {
                        state.done = true;
                        fireHook("done");
                    }
                } else {
                    state.done = true;
                    fireHook("done");
                }
            };
            fireHook("before");
            if (state.stop) {
                fireHook("done");
                return state.result;
            }
            try {
                const res = func.apply(ctx, args);
                state.result = res;
                fireHook("after");
                const isPromise =
                    typeof state.result === "object" &&
                    state.result &&
                    (state.result.then || state.result.catch);
                if (state.needDoneCallback || isPromise) {
                    if (isPromise && state.result.then) {
                        state.result.then((value) => {
                            state.value = value;
                            state.fulfilled = true;
                            fireHook("complete");
                            checkFireDone("promise");
                        });
                    }
                    if (isPromise && state.result.catch) {
                        state.result.catch((e) => {
                            state.fulfilled = false;
                            fireCatch("RejectReason", e);
                            checkFireDone("promise");
                        });
                    }
                } else {
                    fireHook("done");
                }
                return state.result;
            } catch (e) {
                fireCatch("MethodException", e);
                fireHook("done");
                throw e;
            }
        } as unknown) as T;
        return {
            func: targetFunc,
            disable(name?: MkFuncHookName) {
                if (name) {
                    enabled[name] = 0;
                } else {
                    hookNames.forEach((n) => {
                        enabled[n] = 0;
                    });
                }
            },
            enable(name?: MkFuncHookName) {
                if (name) {
                    enabled[name] = 1;
                } else {
                    hookNames.forEach((n) => {
                        enabled[n] = 1;
                    });
                }
            },
        };
    };
})();
