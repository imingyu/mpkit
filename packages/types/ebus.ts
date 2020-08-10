export interface EventData {
    type: string;
    ts: number;
    data?: any;
}
export interface EventHandler {
    (eventData: EventData, ...args: any[]);
}
export interface EBus {
    on(type: string, handler: EventHandler);
    off(type: string, handler?: EventHandler);
    emit(type: string, data: any);
}
export enum EventType {
    All = "All",
    Error = "Error",
    ViewInitLife = "ViewInitLife",
    ViewInitMount = "ViewInitMount",
    ViewMethodStart = "ViewMethodStart",
    ViewMethodEnd = "ViewMethodEnd",
    UIEvent = "UIEvent",
    ApiMethodStart = "ApiMethodStart",
    ApiMethodEnd = "ApiMethodEnd",
    ApiMethodComplete = "ApiMethodComplete",
    RequestStart = "RequestStart",
    RequestEnd = "RequestEnd",
}
