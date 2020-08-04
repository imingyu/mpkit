export enum MpViewType {
    App = "App",
    Page = "Page",
    Component = "Component",
}
export enum MpPlatfrom {
    wechat = "wechat",
    alipay = "alipay",
    smart = "smart",
    tiktok = "tiktok",
    unknown = "unknown",
}
export enum EventType {
    All = "All",
    Error = "Error",
    ViewInitLife = "ViewInitLife",
    ViewInitMount = "ViewInitMount",
    ViewMethodStart = "ViewMethodStart",
    ViewMethodEnd = "ViewMethodEnd",
    UIEvent = "UIEvent",
    ApiMethodStart = "ApiMethodStart",
    ApiMethodEnd = "ApiMethodEnd",
    ApiMethodComplete = "ApiMethodComplete",
    RequestStart = "RequestStart",
    RequestEnd = "RequestEnd",
}
