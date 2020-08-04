import { MkMap } from "./util";
import { wx } from "./global";

export interface MpViewFactory {
    (spec: MpViewPageSpec | MpViewComponentSpec): void;
}
export enum MpViewType {
    App = "App",
    Page = "Page",
    Component = "Component",
}
export interface MpViewSpec {
    data: any;
}
export interface MpViewComponetPropSpec {
    type: Function;
    default?: any;
    observer?: Function;
}
export interface MpViewPageSpec extends MpViewSpec {
    [prop: string]: any;
}
export type MpViewComponentLifes =
    | "created"
    | "attached"
    | "ready"
    | "moved"
    | "detached"
    | "error";
export type MpViewComponentPageLifes = "show" | "hide" | "resize";
export interface MpViewComponentSpec extends MpViewSpec {
    properties?: {
        [prop: string]: Function | MpViewComponetPropSpec;
    };
    lifetimes?: MkMap<MpViewComponentLifes, Function | string>;
    pageLifetimes?: MkMap<MpViewComponentPageLifes, Function | string>;
    methods: {
        [prop: string]: Function;
    };
    [prop: string]: any;
}
export interface MpView {
    $mkSpec: MpViewSpec;
    $mkType: MpViewType;
    $mkKey: string;
    $mkKeyIsDefine?: boolean | string;
    $mkIsRewriteSetData?: boolean;
    $mkNativeSetData: MpSetDataHandler;
    data: any;
    setData: MpSetDataHandler;
}
export interface MpWechatSelectOwnerComponent {
    (): void | MpView;
}
export interface MpWechatView extends MpView {
    __wxExparserNodeId__: string;
    __wxWebviewId__: number;
    is: string;
    selectOwnerComponent: MpWechatSelectOwnerComponent;
}
export interface MpWechatPageView extends MpWechatView {
    route: string;
}
export interface MpTiktokView extends MpView {
    __webviewId__: number;
    __nodeId__: number;
    is: string;
}
export interface MpComponentPropObserver {
    (this: MpView, oldValue: any, newVal: any): void;
}

export interface MpComponentPropSpec {
    type: Function;
    default: any;
    observer: MpComponentPropObserver;
}

export interface MpAlipayView extends MpView {
    $id: number;
}

export interface MpAlipayViewPage extends MpAlipayView {
    $viewId: string;
    route: string;
}
export interface MpAlipayViewComponent extends MpAlipayView {
    $page: MpAlipayViewPage;
    is: string;
    props: {
        [prop: string]: any;
        __tag: string;
    };
}
export interface MpSmartViewPage extends MpView {
    route: string;
}
export interface MpSmartViewComponent extends MpView {
    componentName: string;
    nodeId: string;
    pageinstance: MpSmartViewPage;
    is: string;
}
export interface MpSetDataHandler {
    (data: any, callback?: Function): void;
}