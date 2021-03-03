import { MkEnumMap } from "./util";
import { MkSetData } from "./set-data";
export interface MpAppLaunchOptions {}
export interface MpViewInitLife<V, T> {
    (this: V, options: T): void;
}
export interface MpViewLife<V> {
    (this: V): void;
}
export type MpViewInitLifes = "onLaunch" | "onLoad" | "created" | "onInit";
export type MpViewMountLifes = "onShow" | "attached" | "didMount";
// 小程序App实例
export interface MpViewApp extends MpViewAppSpec, MpView {}
// 小程序App函数接收的配置对象
export interface MpViewAppSpec {
    onLaunch: MpViewInitLife<MpViewApp, MpAppLaunchOptions>;
    onShow: MpViewInitLife<MpViewApp, MpAppLaunchOptions>;
    onHide: MpViewLife<MpViewApp>;
    onError: MpViewLife<MpViewApp>;
    [prop: string]: any;
}
export interface MpAlipayViewApp extends MpViewApp, MpAlipayViewAppSpec {}
export interface MpAlipayViewAppSpec extends MpViewAppSpec {
    onShareAppMessage: MpViewLife<MpAlipayViewApp>;
}

export interface MpViewFactory {
    (spec: MpViewAppSpec | MpViewPageSpec | MpViewComponentSpec | any): void;
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
    lifetimes?: MkEnumMap<MpViewComponentLifes, Function | string>;
    pageLifetimes?: MkEnumMap<MpViewComponentPageLifes, Function | string>;
    methods: {
        [prop: string]: Function;
    };
    [prop: string]: any;
}
export interface MpView {
    $mkSpec: MpViewSpec;
    $mkType: MpViewType;
    $mkKey: string;
    $mkKeyIsDefine?: string;
    $mkNativeSetData: MpSetDataHandler;
    $mkDiffSetDataBeforeValue: MpSetDataHandler;
    $mkSetData: MkSetData;
    $mkSetDataIsBind?: boolean;
    $mkReadyData: any;
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
