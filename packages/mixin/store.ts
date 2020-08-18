import {
    MpMethodHook,
    MkMixinStore,
    ViewInstanceMap,
    MixinStoreHookProp,
    MixinStoreHooks,
} from "@mpkit/types";
import { EBus, EventType } from "@mpkit/types";
import { MpViewType } from "@mpkit/types";
import { getMpInitLifeName, initView, getMpMountLifeName } from "@mpkit/util";
export default (() => {
    let hooks: MixinStoreHooks = {} as MixinStoreHooks;
    let ebus: EBus = null;
    const commonHook = {
        before(methodName, methodArgs) {
            store.emitEvent(EventType.ViewMethodStart, {
                view: this,
                methodName,
                methodArgs,
            });
            if (methodArgs[0] && methodArgs[0].currentTarget) {
                store.emitEvent(EventType.UIEvent, {
                    view: this,
                    triggerMethod: methodName,
                    event: methodArgs[0],
                    triggerMethodArgs: methodArgs,
                });
            }
        },
        after(methodName, methodArgs, methodResult) {
            store.emitEvent(EventType.ViewMethodEnd, {
                view: this,
                methodName,
                methodArgs,
                methodResult,
            });
        },
        catch(methodName, methodArgs, error, errType) {
            store.emitEvent(EventType.Error, {
                view: this,
                type: errType || "ViewMethod",
                methodName,
                methodArgs,
                error,
            });
        },
    };
    const store: MkMixinStore = {
        ViewInstanceMap: {} as ViewInstanceMap,
        ViewInstanceTimeLine: [],
        bindEBus(val: EBus) {
            ebus = val;
        },
        emitEvent(type: EventType, data: any) {
            if (ebus) {
                ebus.emit(EventType.All, {
                    eventType: type,
                    ...data,
                });
                ebus.emit(type, data);
            }
        },
        addHook(type: MixinStoreHookProp, hook: MpMethodHook) {
            if (!hooks[type]) {
                store.getHook(type);
            }
            hooks[type].push(hook);
        },
        getHook(type: MixinStoreHookProp): MpMethodHook[] {
            if (type !== "Api" && !hooks[type]) {
                hooks[type] = [
                    commonHook,
                    {
                        [getMpInitLifeName(type)]: {
                            before(methodName, methodArgs) {
                                initView(this, type);
                                store.ViewInstanceTimeLine.push(this);
                                if (type === MpViewType.App) {
                                    store.ViewInstanceMap[type][
                                        this.$mkKey
                                    ] = this;
                                } else {
                                    store.ViewInstanceMap[type][
                                        this.$mkKey
                                    ] = this;
                                }
                                store.emitEvent(EventType.ViewInitLife, {
                                    view: this,
                                    life: methodName,
                                    options: methodArgs[0],
                                });
                            },
                        },
                        [getMpMountLifeName(type)]: {
                            before(methodName, methodArgs) {
                                initView(this, type);
                                store.emitEvent(EventType.ViewInitMount, {
                                    view: this,
                                    life: methodName,
                                });
                            },
                        },
                    },
                ];
                if (type === MpViewType.Component) {
                    hooks[type].push({
                        observer: {
                            before() {
                                initView(this, type);
                            },
                        },
                    });
                }
            }
            if (type === "Api" && !hooks[type]) {
                hooks[type] = [
                    {
                        before(methodName, methodArgs, methodHandler, funId) {
                            store.emitEvent(EventType.ApiMethodStart, {
                                methodName,
                                methodArgs,
                                funId,
                            });
                        },
                        after(methodName, methodArgs, result, funId) {
                            store.emitEvent(EventType.ApiMethodEnd, {
                                methodName,
                                methodArgs,
                                result,
                                funId,
                            });
                            if (methodName === "request") {
                                store.emitEvent(EventType.RequestStart, {
                                    task: result,
                                    options: methodArgs[0],
                                    funId,
                                });
                            }
                        },
                        complete(
                            methodName: string,
                            methodArgs: any[],
                            result: any,
                            success?: boolean,
                            funId?: string
                        ) {
                            store.emitEvent(EventType.ApiMethodComplete, {
                                methodName,
                                methodArgs,
                                result,
                                success,
                                funId,
                            });
                            if (methodName === "request") {
                                store.emitEvent(EventType.RequestEnd, {
                                    result,
                                    options: methodArgs[0],
                                    funId,
                                    success,
                                });
                            }
                        },
                    },
                ];
            }
            return hooks[type];
        },
    };
    return store;
})();
