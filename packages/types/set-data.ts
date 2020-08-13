import { MpView } from "./view";

export interface MkSetData {
    (this: MpView, data: any, callback: Function): Promise<any>;
}

export interface MkSetDataIgnoreHandler {
    (key: string, value: any): boolean;
}

export interface MkSetDataOptions {
    ignore?: MkSetDataIgnoreHandler | RegExp[];
    diff?: Boolean;
}
