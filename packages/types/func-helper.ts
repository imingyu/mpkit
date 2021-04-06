export interface MkReplaceFunc<T extends Function = Function> {
    (original: T, replacer: T, callback?: MkReplaceFuncCallback): T;
}

export interface MkReplaceFuncStore<T extends Function = Function> {
    data?: any;
    original: T;
    replace();
    restore();
}

export interface MkReplaceFuncCallback<T extends Function = Function> {
    (store: MkReplaceFuncStore<T>);
}

export type MkFuncHookErrorType =
    | "RejectReason"
    | "MethodException"
    | "BeforeException"
    | "AfterException"
    | "CatchException"
    | "CompleteException"
    | "DoneException";

export interface MkFuncHookError<T = Error> {
    type: MkFuncHookErrorType;
    error: T;
}
export interface MkFuncStepResult {
    step: MkFuncHookName | "func";
    result?: any;
}
/**函数钩子状态 */
export interface MkFuncHookState<S = any> {
    /**函数执行的this对象 */
    ctx: any;
    /**函数本身 */
    func: Function;
    /**函数参数列表 */
    args: any[];
    /**函数执行后的结果 */
    result?: any;
    /**每一步执行的结果 */
    stepResultList: MkFuncStepResult[];
    /**该字段为true，则不执行后面的流程（不包括done和catch钩子），如果函数体已经执行，则不会影响result，否则将判断state.result不为undefined时，返回其做为函数结果 */
    stop?: boolean;
    /**所有流程是否都已经结束 */
    done?: boolean;
    /**代表函数返回需等待回调执行 */
    needDoneCallback?: boolean;
    /**如果函数返回需要执行回调，请在特定时期执行该回调，该回调执行后将影响fulfilled和value字段 */
    doneCallback: (err: Error, res?: any) => {};
    /**函数执行后，Promise/Callback状态是否是执行态（resolve），该字段值可能由函数返回的Promise或者doneCallback决定，具体看两者执行时机 */
    fulfilled?: boolean;
    /**函数执行后，Promise/Callback的状态是执行态时，将值存入该字段，该字段值可能由函数返回的Promise或者doneCallback决定，具体看两者执行时机 */
    value?: any;
    /**函数额外的状态，开发者可在before等钩子中向此字段中注入数据，已达到多个钩子间的数据共享 */
    state: S;
    /**函数发生异常列表 */
    errors?: MkFuncHookError[];
}

export interface MkFuncHookHandler<S = any> {
    (state: MkFuncHookState<S>);
}

export type MkFuncHookName = "before" | "after" | "catch" | "complete" | "done";

/**函数钩子 */
export interface MkFuncHook<S = any> {
    /**函数执行前钩子 */
    before?: MkFuncHookHandler<S> | MkFuncHookHandler<S>[];
    /**函数执行后钩子 */
    after?: MkFuncHookHandler<S> | MkFuncHookHandler<S>[];
    /**函数执行过程中发生异常后的钩子，此钩子可能被执行多次 */
    catch?: MkFuncHookHandler<S> | MkFuncHookHandler<S>[];
    /**函数执行返回Promise时，等Promise结束后执行钩子 */
    complete?: MkFuncHookHandler<S> | MkFuncHookHandler<S>[];
    /**函数执行返回Promise则done在complete后执行，否则在after后执行 */
    done?: MkFuncHookHandler<S> | MkFuncHookHandler<S>[];
}

export interface MkFuncHookResult<T extends Function = Function> {
    func: T;
    disable(name?: MkFuncHookName);
    enable(name?: MkFuncHookName);
}
