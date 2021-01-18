import { MpViewType, MpView } from "./view";
import { MkMap, MkEnumMap } from "./util";

interface MpMethodHookLike {
    before?(
        methodName: string,
        methodArgs: any[],
        methodHandler: Function | Array<Function | string>,
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

export interface MkMixinStore {
    addHook(type: MixinStoreHookProp, hook: MpMethodHook);
    getHook(type: MixinStoreHookProp): MpMethodHook[];
}
