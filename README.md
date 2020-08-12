# mpkit

mpkit 是一个模块化的开发多平台小程序的 JavaScript 实用工具库

## 功能

-   ● 完全支持
-   ❍ 部分支持
<table>
    <thead>
        <tr>
            <th rowspan="3">包</th>
            <th colspan="2">适用语言</th>
            <th colspan="6">适用平台</th>
            <th rowspan="3">简介</th>
            <th rowspan="3">备注</th>
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
                [@mpkit/inject](https://www.npmjs.com/package/@mpkit/inject)
            </td>
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
                [查看文档](https://github.com/imingyu/mpkit/tree/master/packages/inject)
            </td>
            <td></td>
        </tr>
        <tr>
            <td>
                [@mpkit/inject](https://www.npmjs.com/package/@mpkit/ebus)
            </td>
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
                [查看文档](https://github.com/imingyu/mpkit/tree/master/packages/ebus)
            </td>
            <td></td>
        </tr>
        <tr>
            <td>
                [@mpkit/mixin](https://www.npmjs.com/package/@mpkit/mixin)
            </td>
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
                [查看文档](https://github.com/imingyu/mpkit/tree/master/packages/mixin)
            </td>
            <td></td>
        </tr>
        <tr>
            <td>
                [@mpkit/mixin](https://www.npmjs.com/package/@mpkit/set-data)
            </td>
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
                [查看文档](https://github.com/imingyu/mpkit/tree/master/packages/set-data)
            </td>
            <td></td>
        </tr>
        <tr>
            <td>
                [@mpkit/mixin](https://www.npmjs.com/package/@mpkit/view-parser)
            </td>
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
                [查看文档](https://github.com/imingyu/mpkit/tree/master/packages/view-parser)
            </td>
            <td></td>
        </tr>
        <tr>
            <td>
                [@mpkit/util](https://www.npmjs.com/package/@mpkit/util)
            </td>
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
                [查看文档](https://github.com/imingyu/mpkit/tree/master/packages/util)
            </td>
            <td></td>
        </tr>
    </tbody>
</table>
