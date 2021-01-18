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
