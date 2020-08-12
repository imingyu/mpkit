## 功能

-   [ ] Mixins
-   [ ] setData 优化
-   [ ] 全局事件捕获
    -   [ ] 网络相关事件（request/downloadFile/uploadFile/webSocket/...）
    -   [ ] Api 相关事件（success/fail/complete）
    -   [ ] 页面相关事件（load/ready/...）
    -   [ ] 组件相关事件（created/ready/...）
    -   [ ] 异常事件（全局异常/promise 异常/setTimeout 异常/...）
-   [ ] 动态获取当前小程序平台
-   [ ] 判断对象是否属于 App/Page/Component 的实例
-   [ ] 获取 Page 与 Component、Component 与 Component 之间的层级关系
-   [ ] 穿透 Page 与 Component 层级，获取某一层级的元素实例

## Api

-   PLATFORM:MpPlatform = MpPlatform.wechat | MpPlatform.alipay | MpPlatform.smart | MpPlatform.tiktok | MpPlatform.unknown;
-   on(eventName:string, handler:Function)
-   off(eventName:string, handler:Function)
-   app(...mixins:MpAppSpec[]):MpAppSpec
-   page(...mixins:MpPageSpec[]):MpPageSpec
-   component(...mixins:MpComponentSpec[]):MpComponentSpec
-   setData(view:MpApp|MpPage|MpComponent, data:any, callback:Function):Promise
-   getParentView(view:MpApp|MpPage|MpComponent):MpApp|MpPage|MpComponent
-   getChildrenView(view:MpApp|MpPage|MpComponent):MpApp|MpPage|MpComponent
