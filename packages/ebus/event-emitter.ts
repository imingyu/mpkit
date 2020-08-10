import { MkMap } from "@mpkit/types";
import { EventHandler, EBus } from "@mpkit/types";
export default class EventEmitter implements EBus {
    private events: MkMap<EventHandler[]> = {};
    constructor() {
        ["on", "off", "emit"].forEach((prop) => {
            this[prop] = this[prop].bind(this);
        });
    }
    on(type: string, handler: EventHandler) {
        if (!this.events[type]) {
            this.events[type] = [] as EventHandler[];
        }
        if (this.events[type].indexOf(handler) === -1) {
            this.events[type].push(handler);
        }
    }
    off(type: string, handler?: EventHandler) {
        if (this.events[type]) {
            if (handler) {
                const index = this.events[type].indexOf(handler);
                index !== -1 && this.events[type].splice(index, 1);
            } else {
                delete this.events[type];
            }
        }
    }
    emit(type: string, data: any) {
        this.events[type] &&
            this.events[type].forEach((handler) => {
                handler({
                    type,
                    ts: Date.now(),
                    data,
                });
            });
    }
}
