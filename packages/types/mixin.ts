import { MpViewType, MpView } from "./view";
import { MkMap, MkEnumMap } from "./util";
import { EBus, EventType } from "./ebus";

interface MpMethodHookLike {
    before?(
        methodName: string,
        methodArgs: any[],
        methodHandler: Function,
        funId?: string
    );
    after?(
        methodName: string,
        methodArgs: any[],
        methodResult: any,
        funId?: string
    );
    catch?(
        methodName: string,
        methodArgs: any[],
        error: Error,
        errType?: string,
        funId?: string
    );
    complete?(
        methodName: string,
        methodArgs: any[],
        res: any,
        success?: boolean,
        funId?: string
    );
}
export interface MpMethodHook extends MpMethodHookLike {
    [prop: string]: Function | MpMethodHookLike;
}

export interface ViewInstanceMap {
    [MpViewType.App]: MpView;
    [MpViewType.Page]: MkMap<MpView>;
    [MpViewType.Component]: MkMap<MpView>;
}

export type MixinStoreHookProp = MpViewType | "Api";
export type MixinStoreHooks = MkEnumMap<MixinStoreHookProp, MpMethodHook[]>;

export interface MixinStore {
    ViewInstanceMap: ViewInstanceMap;
    ViewInstanceTimeLine: MpView[];
    bindEBus(val: EBus);
    emitEvent(type: EventType, data: any);
    addHook(type: MixinStoreHookProp, hook: MpMethodHook);
    getHook(type: MixinStoreHookProp);
}
