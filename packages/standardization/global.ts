import { MpPlatform } from "@mpkit/types";

export const getGlobal = (() => {
    let _mockGlobal;
    let realGlobal;
    return <T = any>(): T => {
        if (realGlobal) {
            return realGlobal;
        }
        if (typeof global === "object") {
            realGlobal = (global as unknown) as T;
        } else if (typeof globalThis === "object") {
            realGlobal = (globalThis as unknown) as T;
        } else if (!_mockGlobal) {
            _mockGlobal = {};
            realGlobal = _mockGlobal;
        }
        return realGlobal;
    };
})();
