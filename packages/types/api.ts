export interface MpApiCallback {
    (res?: any);
}
export interface MpApiMethodOptions {
    success: MpApiCallback;
    fail: MpApiCallback;
    complete: MpApiCallback;
    [prop: string]: any;
}
export interface MpApiMethod {
    (options?: MpApiMethodOptions | any): any;
}

export interface MpApiVar {
    [prop: string]: MpApiMethod;
}
