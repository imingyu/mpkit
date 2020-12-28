import {
    IMkMpXmlContentParseAdapter,
    MkXmlContent,
    MkXmlNode,
} from "@mpkit/types";
import { FxNodeJSON } from "forgiving-xml-parser";
import { parseMpXmlContent } from "../content";

export const contentAdapter: IMkMpXmlContentParseAdapter = {
    parse(
        content: string,
        node?: FxNodeJSON,
        parent?: FxNodeJSON,
        grandpa?: FxNodeJSON
    ): MkXmlContent[] {
        if (node && (node as MkXmlNode).mpContents) {
            return (node as MkXmlNode).mpContents;
        }
        return parseMpXmlContent(content, node);
    },
};
