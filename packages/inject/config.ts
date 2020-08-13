import { MpKitPlugin, MpKitConfig } from "@mpkit/types";
export default {
    rewrite: {
        App: false,
        Page: false,
        Component: false,
        Api: false,
        setData: false,
    },
    plugins: [] as MpKitPlugin[],
} as MpKitConfig;
