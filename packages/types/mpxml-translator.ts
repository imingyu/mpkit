import {
    MkMpXmlParseOptions,
    MkMpXmlSerializeOptions,
    MkXmlNodeJSON,
} from "./mpxml-parser";
import { MpPlatform } from "./platform";

export interface MkMpXmlTranslater<T = any> {
    (node: MkXmlNodeJSON, options?: T): MkXmlNodeJSON;
}
export interface MkMpXmlTranslateOptions {
    sourceParseOptions?: MkMpXmlParseOptions;
    targetSerializeOptions?: MkMpXmlSerializeOptions;
    translater?: MkMpXmlTranslater;
}

export interface MkTranslateAdapter<T = any> {
    match(
        sourcePlatform: MpPlatform | string,
        targetPlatform: MpPlatform | string
    ): boolean;
    translater?: MkMpXmlTranslater<T>;
}
