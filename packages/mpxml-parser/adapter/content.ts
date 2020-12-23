import {
    IMkMpXmlContentParseAdapter,
    MkXmlContent,
    MkXmlNode,
    MkXmlParseMessagePosition,
} from "@mpkit/types";
import { FxNode, FxNodeJSON } from "forgiving-xml-parser";
import { parseContent } from "../util";

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
        return parseContent(
            content,
            node
                ? ((node.type as unknown) as MkXmlParseMessagePosition)
                : undefined,
            node,
            parent,
            grandpa
        ).contents;
    },
};
