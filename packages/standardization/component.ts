import { MpPlatform } from "@mpkit/types";
import { formatArgs } from "./tool";

/**
 * 获取组件实例中属性值，可通过call方式调用
 * @param prop 属性名
 * @param com 组件实例，优先级大于this
 * @param _platform 小程序平台
 */
export function getProp<T = any>(
    prop: string,
    com?: any,
    _platform?: MpPlatform
): T {
    const { ctx, platform } = formatArgs(this, com, _platform);
    if (!ctx) {
        return;
    }
    if (platform === MpPlatform.alipay) {
        return ctx.props ? ctx.props[prop] : undefined;
    }
    return ctx.data
        ? ctx.data[prop]
        : ctx.properties
        ? ctx.properties[prop]
        : undefined;
}

export function getParent<T = any>(
    com?: any,
    _platform?: MpPlatform
): Promise<T> {
    const { ctx, platform } = formatArgs(this, com, _platform);
    if (!ctx) {
        return Promise.reject(new Error("组件实例为空"));
    }
    if (platform === MpPlatform.tiktok) {
        return Promise.reject(new Error("不支持"));
    }
    let parent;
    if (platform === MpPlatform.wechat) {
        parent = ctx.selectOwnerComponent();
        if (!parent) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    parent = ctx.selectOwnerComponent();
                    if (parent && parent instanceof ctx.constructor) {
                        return resolve(parent);
                    }
                    reject(new Error("无法找到父组件实例"));
                }, 50);
            });
        }
        if (parent instanceof ctx.constructor) {
            return Promise.resolve(parent);
        }
        return Promise.reject(new Error("父组件对象非Component实例"));
    }
    return parent;
}
