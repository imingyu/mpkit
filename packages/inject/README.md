# @mpkit/inject

[![Build Status](https://travis-ci.org/imingyu/mpkit.svg?branch=master)](https://travis-ci.org/imingyu/mpkit)
![image](https://img.shields.io/npm/l/@mpkit/inject.svg)
[![image](https://img.shields.io/npm/v/@mpkit/inject.svg)](https://www.npmjs.com/package/@mpkit/inject)
[![image](https://img.shields.io/npm/dt/@mpkit/inject.svg)](https://www.npmjs.com/package/@mpkit/inject)

提供小程序环境适用的多种实用函数或组件，如 setData 优化、Mixin、事件总线等。

教程：https://imingyu.github.io/2020/mpkit/

| 方法/变量                                                                  | 作用                                                                                                                                            | 依赖插件 |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `on(eventName:string, handler:Function)`                                   | 为某全局事件添加监听函数                                                                                                                        | ebus     |
| `off(eventName:string, handler:Function)`                                  | 为某全局事件移除监听函数                                                                                                                        | ebus     |
| `emit(eventName:string, data:any)`                                         | 触发某全局事件并传递数据                                                                                                                        | ebus     |
| `App(...mixins:MpAppSpec[]) : MpAppSpec`                                   | 接收多个对象，对象结构与小程序`App`函数接收的对象结构一致，并将这些对象合并，返回一个新对象，包含所有对象的功能和数据，合并策略下文描述。       | mixin    |
| `Page(...mixins:MpPageSpec[]) : MpPageSpec`                                | 接收多个对象，对象结构与小程序`Page`函数接收的对象结构一致，并将这些对象合并，返回一个新对象，包含所有对象的功能和数据，合并策略下文描述。      | mixin    |
| `Component(...mixins:MpComponentSpec[]) : MpComponentSpec`                 | 接收多个对象，对象结构与小程序`Component`函数接收的对象结构一致，并将这些对象合并，返回一个新对象，包含所有对象的功能和数据，合并策略下文描述。 | mixin    |
| `Api`                                                                      | 与小程序上的`wx` `my` `swan` `tt`等对象的属性和方法一致，只不过在其方法上添加了钩子函数，方便拦截处理                                           | mixin    |
| `MixinStore.addHook(type:string, hook:MpMethodHook)`                       | `MpKit`中内置了很多全局钩子函数，方可实现了全局拦截，setData 重写等功能，而如果你也想在全局添加自己的钩子函数，那么可以调用此函数               | mixin    |
| `setData(view:any, data:any, callback:Function) : Promise<DiffDataResult>` | 以优化的方式向某个 Page/Component 设置数据，仅设置变化的数据，并以 Promise 的方式返回 diff 后的数据结果                                         | set-data |
