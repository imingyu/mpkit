import { MpView, MpViewFactory } from "./view";
import { MpApiVar } from "./api";

interface GetViewHandler<T> {
    (): T;
}
declare global {
    var getApp: GetViewHandler<MpView>;
    var getCurrentPages: GetViewHandler<MpView[]>;
    var wx: MpApiVar;
    var my: MpApiVar;
    var swan: MpApiVar;
    var tt: MpApiVar;
    var App: MpViewFactory;
    var Page: MpViewFactory;
    var Component: MpViewFactory;
}
