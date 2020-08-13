import { EventHandler, EBus } from "./ebus";
import {
    MpViewAppSpec,
    MpViewPageSpec,
    MpViewComponentSpec,
    MpView,
} from "./view";
import { MkSetDataOptions } from "./set-data";
export interface MpKitPlugin {
    name: string;
    apply(mpkit: MpKitInject, config?: any);
}
export interface MpKitRewriteConfig {
    App?: Boolean;
    Page?: Boolean;
    Component?: Boolean;
    Api?: Boolean;
    setData?: Boolean;
}
export interface MpKitConfig {
    rewrite: Boolean | MpKitRewriteConfig;
    plugins: MpKitPlugin[];
    setDataOptions?: MkSetDataOptions;
}

export interface MpKitInject extends EBus {
    App(...specList: MpViewAppSpec[]);
    Page(...specList: MpViewPageSpec[]);
    Component(...specList: MpViewComponentSpec[]);
    Api: any;
    setData(view: MpView, data: any, callback?: Function): Promise<any>;
    getParentView(view: MpView): MpView | void;
    getChildrenView(view: MpView): MpView[] | void;
    hasPlugin(name: string): boolean;
    plugin(plugin: MpKitPlugin);
}
