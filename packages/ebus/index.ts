import EventEmitter from "./event-emitter";
import { MpKitPlugin } from "@mpkit/types";
const ev = new EventEmitter();
export const on = ev.on;
export const off = ev.off;
export const emit = ev.emit;
export const plugin: MpKitPlugin = {
    name: "ebus",
    apply(mpkit) {
        ["on", "off", "emit"].forEach((method) => {
            mpkit[method] = ev[method];
        });
    },
};
