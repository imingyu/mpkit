# mpkit
mpkit是一个一致性、模块化的适用于所有小程序平台的JavaScript实用工具库

## 功能
- [ ] Mixins
- [ ] setData优化
- [ ] 全局事件捕获
    - [ ] 网络相关事件（request/downloadFile/uploadFile/webSocket/...）
    - [ ] Api相关事件（success/fail/complete）
    - [ ] 页面相关事件（load/ready/...）
    - [ ] 组件相关事件（created/ready/...）
    - [ ] 异常事件（全局异常/promise异常/setTimeout异常/...）
- [ ] 动态获取当前小程序平台
- [ ] 判断对象是否属于App/Page/Component的实例
- [ ] 获取Page与Component、Component与Component之间的层级关系
- [ ] 穿透Page与Component层级，获取某一层级的元素实例


## Api
- PLATFORM:MpPlatform = MpPlatform.wechat | MpPlatform.alipay | MpPlatform.smart | MpPlatform.tiktok | MpPlatform.unknown;
- on(eventName:string, handler:Function)
- off(eventName:string, handler:Function)
- app(...mixins:MpAppSpec[]):MpAppSpec
- page(...mixins:MpPageSpec[]):MpPageSpec
- component(...mixins:MpComponentSpec[]):MpComponentSpec
- setData(view:MpApp|MpPage|MpComponent, data:any, callback:Function):Promise
- getParentView(view:MpApp|MpPage|MpComponent):MpApp|MpPage|MpComponent
- getChildrenView(view:MpApp|MpPage|MpComponent):MpApp|MpPage|MpComponent