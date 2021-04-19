import { MpView, MpKitInject, MpKitConfig, MpKitPlugin } from "@mpkit/types";
import { MkSetDataOptions } from "@mpkit/types";
import {
    isMpIvew,
    clone,
    isValidObject,
    isEmptyObject,
    isUndefined,
} from "@mpkit/util";
import { isFunc } from "@mpkit/util";
import { MkSetDataIgnoreHandler } from "@mpkit/types";

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

/**
 * 将对象相同属性名的值合并，并返回一个新对象
 */
export const mergeEqualProp = <T = any>(obj: T): T => {
    if (typeof obj !== "object" || !obj) {
        return obj;
    }
    const res: any = {};
    for (let prop in obj) {
        res[prop] = obj[prop];
    }
    return res as T;
};

// 此正则表达式来自lodash:_stringToPath.js  https://github.com/lodash/lodash
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * 展开对象，按照对象key的顺序依次进行展开，后面的值可将前面的值覆盖，如：
 * 1.{'user.age':20,'user':{}} 返回的将是{'user':{}};
 * 2.{'arr[3].age':20,'arr.length':1} 返回的将是{'arr':[Empty x1]};
 * 3.data中传入的arr.length要比viewOrSourceFullMpData中的优先级高，如果不传入length则使用viewOrSourceFullMpData中的（倘若viewOrSourceFullMpData中的不为空的话）
 * TODO: 支持deep参数
 * @param data 要展开的对象
 * @param sourceFullMpData 原始的未经diff修改的完整的对比data
 * @returns 展开后的结果对象
 */
export const openMpData = (data: any, sourceFullMpData?: any) => {
    const result = {};
    data = mergeEqualProp(data);
    Object.keys(data).forEach((key) => {
        const items = [];
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
        /**
         * {
         *      'list[0].name':1,
         *      'list[5].name':2,
         *      'list[0]':{name:1},
         *      'user.name':1,
         *      'user':{name:1}
         * }
         */

        let obj = result;
        let source = sourceFullMpData;
        items.forEach((propItem) => {
            const sourceVal = source ? source[propItem.name] : null;
            if (!("value" in propItem)) {
                if (!(propItem.name in obj)) {
                    obj[propItem.name] = clone(sourceVal);
                }
                if (propItem.array) {
                    if (!Array.isArray(obj[propItem.name])) {
                        obj[propItem.name] = [];
                    }
                } else if (
                    typeof obj[propItem.name] !== "object" ||
                    !obj[propItem.name]
                ) {
                    obj[propItem.name] = {};
                }
            } else {
                obj[propItem.name] = clone(propItem.value);
            }
            obj = obj[propItem.name];
            source = sourceVal;
        });
    });
    return result;
};

// TODO: 要处理循环引用或者对象是复杂对象的情况
export const diffMpData = (() => {
    const diff = (source, target, result?: any, path?: string) => {
        if (typeof source !== "object" || !source) {
            return target;
        }
        const targetKeys = Object.keys(target);
        if (result) {
            /**
             * 当target数组长度小于source的长度时，需要将source完全替换成target避免产生错误，详情见：
             * https://developers.weixin.qq.com/community/develop/article/doc/0000ec6fe2c960e426a9fcf4151c13
             */
            if (
                Array.isArray(target) &&
                (!source || source.length > target.length)
            ) {
                result[path] = target;
                return;
            }
            const sourceKeys = Object.keys(source);
            // 如果target的keys包含source的keys则需要merge，否则直接返回target
            if (
                sourceKeys.length > targetKeys.length ||
                (sourceKeys.length === targetKeys.length &&
                    sourceKeys.join(",") !== targetKeys.join(","))
            ) {
                result[path] = target;
                return;
            }
        }
        result = result || {};

        Object.keys(target).forEach((targetKey, targetKeyIndex, arr) => {
            const targetValue = target[targetKey];
            const prop = path
                ? Array.isArray(target)
                    ? `${path}[${targetKey}]`
                    : `${path}.${targetKey}`
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
                } else if (
                    isEmptyObject(sourceValue) ||
                    isEmptyObject(targetValue)
                ) {
                    result[prop] = targetValue;
                } else {
                    diff(sourceValue, targetValue, result, prop);
                }
            }
        });

        return result;
    };
    return (source, target) => {
        return diff(source, target);
    };
})();
export const replaceUndefinedValues = (obj: any, replaceVal: any) => {
    if (isUndefined(replaceVal) || typeof obj !== "object" || !obj) {
        return obj;
    }
    Object.keys(obj).forEach((key) => {
        const type = typeof obj[key];
        if (type === "undefined") {
            obj[key] = replaceVal;
        } else if (type === "object" && obj[key]) {
            replaceUndefinedValues(obj[key], replaceVal);
        }
    });
    return obj;
};

export class MkSetDataPerformer {
    private options: MkSetDataOptions;
    constructor(options?: MkSetDataOptions) {
        this.options = Object.assign({}, defaultSetDataOptions, options || {});
        this.exec = this.exec.bind(this);
        if (isFunc(this.options.ignore)) {
            this.ignoreValue = this.options.ignore as MkSetDataIgnoreHandler;
        }
    }
    bindView(view: MpView) {
        if (!view.$mkSetDataIsBind) {
            view.$mkReadyData = clone(view.$mkSpec.data);
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
                    result[prop] = data[prop];
                }
            }
            return result;
        }
        return data;
    }
    exec<T>(view: MpView, data: T, callback: Function): Promise<T | void> {
        return new Promise((resolve, reject) => {
            if (isMpIvew(view) && isFunc(view.$mkDiffSetDataBeforeValue)) {
                this.bindView(view);
                if (!isValidObject(data)) {
                    callback && callback();
                    return resolve();
                }
                data = openMpData(data, view.$mkReadyData) as T;
                Object.assign(view.data, data);
                const ignoreResult = this.ignoreData(data);
                if (!isValidObject(ignoreResult)) {
                    callback && callback();
                    return resolve();
                }
                if (!this.options.diff) {
                    Object.assign(view.$mkReadyData, ignoreResult);
                    return view.$mkDiffSetDataBeforeValue(ignoreResult, () => {
                        callback && callback();
                        return resolve(ignoreResult);
                    });
                }
                const diffResult = diffMpData(view.$mkReadyData, ignoreResult);
                Object.assign(view.$mkReadyData, ignoreResult);
                if (!isValidObject(diffResult)) {
                    callback && callback();
                    return resolve();
                }
                return view.$mkDiffSetDataBeforeValue(diffResult, () => {
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
