import { MpViewType, MpPlatfrom } from "./enum";
import { getMpPlatform, uuid } from "./util";
export interface MpViewSpec {
    data: any;
}
export interface MpViewComponetPropSpec {
    type: Function;
    default?: any;
    observer?: Function;
}
export interface MpViewComponentSpec extends MpViewSpec {
    properties?: {
        [prop: string]: Function | MpViewComponetPropSpec;
    };
    methods: {
        [prop: string]: Function;
    };
}
export interface MpView {
    $mkSpec: MpViewSpec;
    $mkType: MpViewType;
    $mkKey: string;
    $mkKeyIsDefine?: boolean | string;
    $mkIsRewriteSetData?: boolean;
    $mkNativeSetData: SetDataHandler;
    data: any;
    setData: SetDataHandler;
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
export interface SetDataHandler {
    (data: any, callback?: Function): void;
}

export const initView = (view: MpView, viewType: MpViewType) => {
    defineViewType(view, viewType);
    defineViewKey(view);
};

const defineViewKey = (view: MpView) => {
    if (!view.$mkKeyIsDefine) {
        const MP_PLATFORM = getMpPlatform();
        view.$mkKeyIsDefine = MP_PLATFORM === MpPlatfrom.smart ? uuid() : true;
        Object.defineProperty(view, "$mkKey", {
            get() {
                return getMpNativeViewId(this, getMpViewType(this));
            },
        });
    }
};
const defineViewType = (view: MpView, value: MpViewType) => {
    if (!view.$mkType) {
        Object.defineProperty(view, "$mkType", {
            value,
        });
    }
    return value;
};
export const getMpViewType = (view: MpView): MpViewType => {
    if (!view.$mkType) {
        if ("route" in view || "__route__" in view) {
            return defineViewType(view, MpViewType.Page);
        }
        if ("triggerEvent" in view) {
            return defineViewType(view, MpViewType.Component);
        }
        if ("props" in view && getMpPlatform() === MpPlatfrom.alipay) {
            return defineViewType(view, MpViewType.Component);
        }
        if (typeof getApp === "function" && getApp() === view) {
            return defineViewType(view, MpViewType.App);
        }
        return defineViewType(view, MpViewType.Page);
    }
    return view.$mkType;
};

export const getMpNativeViewId = (
    vm: MpView,
    viewType?: MpViewType
): string => {
    if (!viewType) {
        viewType = getMpViewType(vm);
    }
    const MP_PLATFORM = getMpPlatform();
    if (MP_PLATFORM === MpPlatfrom.unknown) {
        return "unknown";
    }
    if (viewType === MpViewType.App) {
        return "app";
    }
    if (viewType === MpViewType.Page) {
        if (MP_PLATFORM === MpPlatfrom.wechat) {
            return (vm as MpWechatView).__wxWebviewId__ + "";
        }
        if (MP_PLATFORM === MpPlatfrom.alipay) {
            return (vm as MpAlipayViewPage).$viewId;
        }
        if (MP_PLATFORM === MpPlatfrom.tiktok) {
            return (vm as MpTiktokView).__webviewId__ + "";
        }
        if (MP_PLATFORM === MpPlatfrom.smart) {
            defineViewKey(vm);
            return (vm as MpSmartViewPage).$mkKey;
        }
    }
    if (viewType === MpViewType.Component) {
        if (MP_PLATFORM === MpPlatfrom.wechat) {
            return (vm as MpWechatView).__wxExparserNodeId__;
        }
        if (MP_PLATFORM === MpPlatfrom.alipay) {
            return (vm as MpAlipayViewComponent).$id + "";
        }
        if (MP_PLATFORM === MpPlatfrom.tiktok) {
            return (vm as MpTiktokView).__nodeId__ + "";
        }
        if (MP_PLATFORM === MpPlatfrom.smart) {
            return (vm as MpSmartViewComponent).nodeId;
        }
    }
};
export const getMpComponentPageNativeViewId = (vm: MpView): string => {
    const MP_PLATFORM = getMpPlatform();
    if (MP_PLATFORM === MpPlatfrom.wechat) {
        return (vm as MpWechatView).__wxWebviewId__ + "";
    }
    if (MP_PLATFORM === MpPlatfrom.alipay) {
        return getMpNativeViewId((vm as MpAlipayViewComponent).$page);
    }
    if (MP_PLATFORM === MpPlatfrom.tiktok) {
        return (vm as MpTiktokView).__webviewId__ + "";
    }
    if (MP_PLATFORM === MpPlatfrom.smart) {
        return getMpNativeViewId((vm as MpSmartViewComponent).pageinstance);
    }
};
export const getMpViewPathName = (
    viewType: MpViewType,
    vm?: MpView
): string => {
    if (viewType === MpViewType.App) {
        return "app";
    }
    if (!vm) {
        return "";
    }
    const MP_PLATFORM = getMpPlatform();
    if (MP_PLATFORM === MpPlatfrom.wechat) {
        return (vm as MpWechatView).is;
    }
    if (MP_PLATFORM === MpPlatfrom.alipay) {
        if (viewType === MpViewType.Page) {
            return (vm as MpAlipayViewPage).route;
        }
        return (vm as MpAlipayViewComponent).is;
    }
    if (MP_PLATFORM === MpPlatfrom.tiktok) {
        return (vm as MpTiktokView).is;
    }
    if (MP_PLATFORM === MpPlatfrom.smart) {
        if (viewType === MpViewType.Page) {
            return (vm as MpSmartViewPage).route;
        }
        return (vm as MpSmartViewComponent).is;
    }
};
