import { MkReplaceFuncCallback } from "@mpkit/types";

export function replaceFunc<T extends Function = Function>(
    original: T,
    replacer: T,
    callback?: MkReplaceFuncCallback,
    data?: any
): T {
    let isReplace = true;
    callback &&
        callback({
            data,
            original,
            replace() {
                isReplace = true;
            },
            restore() {
                isReplace = false;
            },
        });
    return (function (...args) {
        if (isReplace) {
            return replacer.apply(this, args);
        } else {
            return original.apply(this, args);
        }
    } as unknown) as T;
}
