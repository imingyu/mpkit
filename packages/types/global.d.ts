import { MpView, MpViewFactory } from "./view";
import { MpApiVar } from "./api";

interface GetViewHandler<T> {
    (): T;
}

declare var getApp: GetViewHandler<MpView>;
declare var getCurrentPages: GetViewHandler<MpView[]>;
declare var wx: MpApiVar;
declare var my: MpApiVar;
declare var swan: MpApiVar;
declare var tt: MpApiVar;
declare var App: MpViewFactory;
declare var Page: MpViewFactory;
declare var Component: MpViewFactory;
