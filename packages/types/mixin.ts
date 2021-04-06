import {
    MpViewType,
    MpView,
    MpViewComponetPropSpec,
    MpViewComponentLifes,
    MpViewComponentPageLifes,
} from "./view";
import { MkMap, MkEnumMap } from "./util";

export interface MkMixinMethodHookState {
    id: string;
}

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

export interface MkViewFormatSpec {
    specialProps?: {
        lifetimes?: MkEnumMap<MpViewComponentLifes, Function | string>[];
        pageLifetimes?: MkEnumMap<
            MpViewComponentPageLifes,
            Function | string
        >[];
        properties?: Array<{
            [prop: string]: Function | MpViewComponetPropSpec | any;
        }>;
        methods?: Array<{
            [prop: string]: Function;
        }>;
    };
    methodMap?: {
        [prop: string]: Function[];
    };
    [prop: string]: any;
}
