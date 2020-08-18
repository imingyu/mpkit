# @mpkit/inject

[![Build Status](https://travis-ci.org/imingyu/mpkit.svg?branch=master)](https://travis-ci.org/imingyu/mpkit)
![image](https://img.shields.io/npm/l/@mpkit/inject.svg)
[![image](https://img.shields.io/npm/v/@mpkit/inject.svg)](https://www.npmjs.com/package/@mpkit/inject)
[![image](https://img.shields.io/npm/dt/@mpkit/inject.svg)](https://www.npmjs.com/package/@mpkit/inject)

提供小程序环境适用的多种实用函数或组件，如 setData 优化、Mixin、事件总线等。

## 功能

-   [x] Mixins
-   [x] setData 优化
-   [x] 全局事件捕获
    -   [x] 网络相关事件（request/downloadFile/uploadFile/webSocket/...）
    -   [x] Api 相关事件（success/fail/complete）
    -   [x] 页面相关事件（load/ready/...）
    -   [x] 组件相关事件（created/ready/...）
    -   [x] 异常事件（全局异常/promise 异常/setTimeout 异常/...）
-   [x] 动态获取当前小程序平台
-   [x] 判断对象是否属于 App/Page/Component 的实例
-   [ ] 获取 Page 与 Component、Component 与 Component 之间的层级关系
-   [ ] 穿透 Page 与 Component 层级，获取某一层级的元素实例

## Api

-   `on(eventName:string, handler:Function)`
-   `off(eventName:string, handler:Function)`
-   `App(...mixins:MpAppSpec[]):MpAppSpec`
-   `Page(...mixins:MpPageSpec[]):MpPageSpec`
-   `Component(...mixins:MpComponentSpec[]):MpComponentSpec`
-   `setData(view:MpApp|MpPage|MpComponent, data:any, callback:Function):Promise<DiffDataResult>`
