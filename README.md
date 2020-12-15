# MpKit

[![Build Status](https://travis-ci.org/imingyu/mpkit.svg?branch=master)](https://travis-ci.org/imingyu/mpkit)
![image](https://img.shields.io/npm/l/@mpkit/inject.svg)
[![image](https://img.shields.io/npm/v/@mpkit/inject.svg)](https://www.npmjs.com/package/@mpkit/inject)

MpKit 是一个模块化的开发多平台小程序的 JavaScript 实用工具库

教程：https://imingyu.github.io/2020/mpkit/

## 功能

-   ● 完全支持
-   ❍ 部分支持

<table>
            <thead>
                <tr>
                    <th rowspan="3">包</th>
                    <th rowspan="3">状态</th>
                    <th colspan="2">适用语言</th>
                    <th colspan="6">适用平台</th>
                    <th rowspan="3">简介</th>
                </tr>
                <tr>
                    <th rowspan="2">TypeScript</th>
                    <th rowspan="2">JavaScript</th>
                    <th colspan="4">小程序</th>
                    <th rowspan="2">H5</th>
                    <th rowspan="2">Node.js</th>
                </tr>
                <tr>
                    <th>微信</th>
                    <th>支付宝</th>
                    <th>百度</th>
                    <th>字节跳动</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <a href="https://www.npmjs.com/package/@mpkit/inject"
                            >@mpkit/inject</a
                        >
                    </td>
                    <td>已完成</td>
                    <td>●</td>
                    <td>●</td>
                    <td><!--微信-->●</td>
                    <td><!--支付宝-->●</td>
                    <td><!--百度-->●</td>
                    <td><!--字节跳动-->●</td>
                    <td><!--h5--></td>
                    <td><!--node--></td>
                    <td>
                        提供小程序环境适用的多种实用函数或组件，如setData优化、Mixin、事件总线等。
                        <a
                            href="https://github.com/imingyu/mpkit/tree/master/packages/inject"
                            >查看文档</a
                        >
                    </td>
                </tr>
                <tr>
                    <td>
                        <a href="https://www.npmjs.com/package/@mpkit/ebus"
                            >@mpkit/ebus</a
                        >
                    </td>
                    <td>已完成</td>
                    <td>●</td>
                    <td>●</td>
                    <td><!--微信-->●</td>
                    <td><!--支付宝-->●</td>
                    <td><!--百度-->●</td>
                    <td><!--字节跳动-->●</td>
                    <td><!--h5-->●</td>
                    <td><!--node-->●</td>
                    <td>
                        提供事件触发、监听等功能。
                        <a
                            href="https://github.com/imingyu/mpkit/tree/master/packages/ebus"
                            >查看文档</a
                        >
                    </td>
                </tr>
                <tr>
                    <td>
                        <a href="https://www.npmjs.com/package/@mpkit/mixin"
                            >@mpkit/mixin</a
                        >
                    </td>
                    <td>已完成</td>
                    <td>●</td>
                    <td>●</td>
                    <td><!--微信-->●</td>
                    <td><!--支付宝-->●</td>
                    <td><!--百度-->●</td>
                    <td><!--字节跳动-->●</td>
                    <td><!--h5--></td>
                    <td><!--node--></td>
                    <td>
                        为小程序提供混入功能。
                        <a
                            href="https://github.com/imingyu/mpkit/tree/master/packages/mixin"
                            >查看文档</a
                        >
                    </td>
                </tr>
                <tr>
                    <td>
                        <a href="https://www.npmjs.com/package/@mpkit/set-data"
                            >@mpkit/set-data</a
                        >
                    </td>
                    <td>已完成</td>
                    <td>●</td>
                    <td>●</td>
                    <td><!--微信-->●</td>
                    <td><!--支付宝-->●</td>
                    <td><!--百度-->●</td>
                    <td><!--字节跳动-->●</td>
                    <td><!--h5--></td>
                    <td><!--node--></td>
                    <td>
                        小程序setData优化。
                        <a
                            href="https://github.com/imingyu/mpkit/tree/master/packages/set-data"
                            >查看文档</a
                        >
                    </td>
                </tr>
                <tr>
                    <td>
                        <a
                            href="https://www.npmjs.com/package/@mpkit/view-parser"
                            >@mpkit/view-parser</a
                        >
                    </td>
                    <td>已完成</td>
                    <td>●</td>
                    <td>●</td>
                    <td><!--微信--></td>
                    <td><!--支付宝--></td>
                    <td><!--百度--></td>
                    <td><!--字节跳动--></td>
                    <td><!--h5--></td>
                    <td><!--node-->●</td>
                    <td>
                        将小程序模板编译为ast。
                        <a
                            href="https://github.com/imingyu/mpkit/tree/master/packages/view-parser"
                            >查看文档</a
                        >
                    </td>
                </tr>
                <tr>
                    <td>
                        <a
                            href="https://www.npmjs.com/package/@mpkit/mpxml-translator"
                            >@mpkit/mpxml-translator</a
                        >
                    </td>
                    <td></td>
                    <td>●</td>
                    <td>●</td>
                    <td><!--微信--></td>
                    <td><!--支付宝--></td>
                    <td><!--百度--></td>
                    <td><!--字节跳动--></td>
                    <td><!--h5--></td>
                    <td><!--node-->●</td>
                    <td>
                        将一种小程序xml转译为另一种小程序的xml，如将wxml转为axml;
                    </td>
                </tr>
                <tr>
                    <td>
                        <a href="https://www.npmjs.com/package/@mpkit/util"
                            >@mpkit/util</a
                        >
                    </td>
                    <td>已完成</td>
                    <td>●</td>
                    <td>●</td>
                    <td><!--微信-->❍</td>
                    <td><!--支付宝-->❍</td>
                    <td><!--百度-->❍</td>
                    <td><!--字节跳动-->❍</td>
                    <td><!--h5-->❍</td>
                    <td><!--node-->❍</td>
                    <td>
                        工具函数。
                        <a
                            href="https://github.com/imingyu/mpkit/tree/master/packages/util"
                            >查看文档</a
                        >
                    </td>
                </tr>
            </tbody>
        </table>
