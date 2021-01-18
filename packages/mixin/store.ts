import {
    MpMethodHook,
    MkMixinStore,
    MixinStoreHookProp,
    MixinStoreHooks,
} from "@mpkit/types";
import { MpViewType } from "@mpkit/types";
import { getMpInitLifeName, initView, getMpMountLifeName } from "@mpkit/util";
export default (() => {
    let hooks: MixinStoreHooks = {} as MixinStoreHooks;
    const store: MkMixinStore = {
        addHook(type: MixinStoreHookProp, hook: MpMethodHook) {
            if (!hooks[type]) {
                store.getHook(type);
            }
            hooks[type].push(hook);
        },
        getHook(type: MixinStoreHookProp): MpMethodHook[] {
            if (type !== "Api" && !hooks[type]) {
                hooks[type] = [
                    {
                        [getMpInitLifeName(type)]: {
                            before(methodName, methodArgs) {
                                initView(this, type);
                            },
                        },
                        [getMpMountLifeName(type)]: {
                            before(methodName, methodArgs) {
                                initView(this, type);
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
            return hooks[type];
        },
    };
    return store;
})();
