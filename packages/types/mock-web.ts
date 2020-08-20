export interface MkEventTargetEvent {
    readonly isTrusted: boolean;
    readonly type: string;
    readonly target: any;
}
export interface MkEventTargetEventHandler {
    (event: MkEventTargetEvent);
}
export interface MkEventTargetEventListener {
    handleEvent: MkEventTargetEventHandler;
}
