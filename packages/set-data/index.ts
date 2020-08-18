import { MpView, MpKitInject, MpKitConfig, MpKitPlugin } from "@mpkit/types";
import { MkSetDataOptions } from "@mpkit/types";
import {
    isMpIvew,
    safeJSON,
    merge,
    isValidObject,
    getMpViewPathName,
    getMpViewType,
} from "@mpkit/util";

export const defaultSetDataOptions: MkSetDataOptions = {
    // 排除哪些数据？
    ignore(key, value) {
        if (isMpIvew(value)) {
            return false;
        }
        return true;
    },
    // 是否开启数据比对，并将比对后的结果进行实际set
    diff: true,
};

// 此正则表达式来自lodash:_stringToPath.js  https://github.com/lodash/lodash
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

export const openMpData = (data, view?: MpView) => {
    const result = {};
    Object.keys(data).forEach((key) => {
        const items = [];
        if ((view && key.indexOf(".") !== -1) || key.indexOf("[") !== -1) {
            key.split(".").forEach((item) => {
                if (item) {
                    const openIndex = item.indexOf("[");
                    const closeIndex = item.indexOf("]");
                    if (
                        (openIndex !== -1 && closeIndex === -1) ||
                        (openIndex === -1 && closeIndex !== -1) ||
                        (openIndex !== -1 && closeIndex !== item.length - 1)
                    ) {
                        let msg;
                        if (
                            openIndex !== -1 &&
                            closeIndex !== item.length - 1
                        ) {
                            msg = `本次${getMpViewPathName(
                                getMpViewType(view),
                                view
                            )}的setData操作中包含的对象路径（${key}）末尾包含空格：${item}`;
                        } else {
                            msg = `本次${getMpViewPathName(
                                getMpViewType(view),
                                view
                            )}的setData操作中包含的对象路径（${key}）存在[]缺少闭合的情况：${item}`;
                        }
                        console.error(msg);
                    }
                } else {
                    console.error(
                        `本次${getMpViewPathName(
                            getMpViewType(view),
                            view
                        )}的setData操作中包含空的对象路径：${key}`
                    );
                }
            });
        }
        let prevProp;
        key.match(rePropName).forEach((item, index, arr) => {
            if (item.indexOf("[") !== -1 || item.indexOf("]") !== -1) {
                let val = item.replace("[", "").replace("]", "");
                if (parseInt(val) + "" === val) {
                    if (prevProp) {
                        prevProp.array = true;
                    }
                }
                prevProp = {
                    name: parseInt(val),
                };
                items.push(prevProp);
            } else {
                prevProp = {
                    name: item,
                };
                items.push(prevProp);
            }
            if (index === arr.length - 1) {
                prevProp.value = data[key];
            }
        });
        let obj = result;
        items.forEach((propItem) => {
            if (propItem.value) {
                obj[propItem.name] = propItem.value;
            }
            if (!obj[propItem.name]) {
                if (propItem.array) {
                    obj[propItem.name] = [];
                } else {
                    obj[propItem.name] = {};
                }
            }
            obj = obj[propItem.name];
        });
    });
    return result;
};

export const diffMpData = (source, target, result?: any, path?: string) => {
    result = result || {};
    Object.keys(target).forEach((targetKey) => {
        const targetValue = target[targetKey];
        const prop = path
            ? Array.isArray(target)
                ? `${path}[${targetKey}]`
                : `${path}['${targetKey}']`
            : targetKey;
        if (!(targetKey in source)) {
            result[prop] = targetValue;
        } else {
            const sourceValue = source[targetKey];
            const targetValType = typeof targetValue;
            const sourceValType = typeof sourceValue;
            if (sourceValType !== targetValType) {
                result[prop] = targetValue;
            } else if (sourceValType !== "object") {
                if (sourceValue !== targetValue) {
                    result[prop] = targetValue;
                }
            } else if (!sourceValue || !targetValue) {
                result[prop] = targetValue;
            } else if (
                (Array.isArray(sourceValue) && !sourceValue.length) ||
                (Array.isArray(targetValue) && !targetValue.length)
            ) {
                result[prop] = targetValue;
            } else {
                diffMpData(sourceValue, targetValue, result, prop);
            }
        }
    });
    return result;
};

export class MkSetDataPerformer {
    private options: MkSetDataOptions;
    constructor(options?: MkSetDataOptions) {
        this.options = merge({}, defaultSetDataOptions, options || {});
        this.exec = this.exec.bind(this);
        if (typeof this.options.ignore === "function") {
            this.ignoreValue = this.options.ignore;
        }
    }
    bindView(view: MpView) {
        if (!view.$mkSetDataIsBind) {
            view.$mkReadyData = safeJSON(view.$mkSpec.data);
            view.$mkSetDataIsBind = true;
        }
    }
    ignoreValue(key: string, value?: any): boolean {
        if (Array.isArray(this.options.ignore)) {
            return this.options.ignore.some((item) => {
                if (item instanceof RegExp) {
                    return item.test(key);
                }
                return true;
            });
        }
        return true;
    }
    ignoreData(data: any) {
        if (this.options.ignore) {
            const result = {};
            for (let prop in data) {
                if (this.ignoreValue(prop)) {
                    result[prop] = data;
                }
            }
            return result;
        }
        return data;
    }
    exec(view: MpView, data: any, callback: Function): Promise<any> {
        return new Promise((resolve, reject) => {
            if (isMpIvew(view) && typeof view.$mkNativeSetData === "function") {
                this.bindView(view);
                if (!isValidObject(data)) {
                    callback && callback();
                    return resolve();
                }
                merge(view.data, data);
                const ignoreResult = this.ignoreData(data);
                if (!isValidObject(ignoreResult)) {
                    callback && callback();
                    return resolve();
                }
                merge(view.$mkReadyData, ignoreResult);
                if (!this.options.diff) {
                    return view.$mkNativeSetData(ignoreResult, () => {
                        callback && callback();
                        return resolve(ignoreResult);
                    });
                }
                const diffResult = diffMpData(
                    ignoreResult,
                    openMpData(ignoreResult, view)
                );
                if (!isValidObject(diffResult)) {
                    callback && callback();
                    return resolve();
                }
                return view.$mkNativeSetData(diffResult, () => {
                    callback && callback();
                    return resolve(diffResult);
                });
            } else {
                return reject(
                    new Error("无法在非小程序页面/组件实例上执行setData")
                );
            }
        });
    }
}

export const plugin: MpKitPlugin = {
    name: "set-data",
    apply(mpkit: MpKitInject, config?: MpKitConfig) {
        const performer = new MkSetDataPerformer(config.setDataOptions);
        mpkit.setData = performer.exec;
    },
};
