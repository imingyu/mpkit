import { EventHandler, EBus } from "./ebus";
import {
    MpViewAppSpec,
    MpViewPageSpec,
    MpViewComponentSpec,
    MpView,
} from "./view";
export interface MpKitPlugin {
    name: string;
    apply(mpkit: MpKitInject, config?: any);
}
export interface MpKitRewriteConfig {
    App: Boolean;
    Page: Boolean;
    Component: Boolean;
    Api: Boolean;
}
export interface MpKitConfig {
    rewrite: Boolean | MpKitRewriteConfig;
    plugins: MpKitPlugin[];
}

export interface MpKitInject extends EBus {
    App(...specList: MpViewAppSpec[]);
    Page(...specList: MpViewPageSpec[]);
    Component(...specList: MpViewComponentSpec[]);
    Api: any;
    setData(view: MpView, data: any, callback?: Function): Promise<any>;
    getParentView(view: MpView): MpView | void;
    getChildrenView(view: MpView): MpView[] | void;
    plugin(plugin: MpKitPlugin);
}
