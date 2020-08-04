export interface MpApiCallback {
    (res?: any);
}
export interface MpApiMethodArg {
    success: MpApiCallback;
    fail: MpApiCallback;
    complete: MpApiCallback;
    [prop: string]: any;
}
export interface MpApiMethod {
    (options?: MpApiMethodArg | any): any;
}

export interface MpApiVar {
    [prop: string]: MpApiMethod;
}
export enum MpRequestOptionsMethod {
    OPTIONS = "OPTIONS",
    GET = "GET",
    POST = "POST",
    HEAD = "HEAD",
    PUT = "PUT",
    DELETE = "DELETE",
    TRACE = "TRACE",
    CONNECT = "CONNECT",
}
export interface MpRequestOptions extends MpApiMethodArg {
    url: string;
    method: MpRequestOptionsMethod;
    headers?: {
        [prop: string]: string | number;
    };
}
export interface MpRequestTask {
    abort: Function;
}
export interface MpApiRequestMethod {
    (options: MpRequestOptions): MpRequestTask;
}
