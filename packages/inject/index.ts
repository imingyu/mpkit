import { MpKitInject, MpKitPlugin, MkMap } from "@mpkit/types";
import { getApiVar } from "@mpkit/util";
import MpKitConfig from "./config";
class MpKit implements MpKitInject {
    private plugins: MkMap<MpKitPlugin> = {};
    static mopckApi(apiName: string, pluginNames: string | string[]) {
        return function (this: MpKit, ...args) {
            const pluginName = Array.isArray(pluginNames)
                ? pluginNames.join(",")
                : pluginNames;
            console.warn(
                `${apiName}的功能需要${pluginName}插件实现，请在引入MpKit时，调用plugin方法装载这些插件。`
            );
            return args[0];
        };
    }
    Api = getApiVar();
    on = MpKit.mopckApi("on", "ebus");
    off = MpKit.mopckApi("off", "ebus");
    emit = MpKit.mopckApi("emit", "ebus");
    App = MpKit.mopckApi("App", "mixin");
    Page = MpKit.mopckApi("App", "mixin");
    Component = MpKit.mopckApi("App", "mixin");
    setData = MpKit.mopckApi("setData", "setData");
    getParentView = MpKit.mopckApi("getParentView", ["mixin", "view"]);
    getChildrenView = MpKit.mopckApi("getParentView", ["mixin", "view"]);
    plugin(plugin: MpKitPlugin) {
        this.plugins[plugin.name] = plugin;
        plugin.apply(this, MpKitConfig);
    }
}
const defaultMpKit = new MpKit() as MpKitInject;
if (MpKitConfig && MpKitConfig.plugins) {
    MpKitConfig.plugins.forEach((plugin) => {
        defaultMpKit.plugin(plugin);
    });
}
export default defaultMpKit;
