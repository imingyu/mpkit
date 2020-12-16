import {
    IMkMpXmlContentParseAdapter,
    MkXmlContent,
    MkXmlParseMessagePosition,
} from "@mpkit/types";
import { FxNode } from "forgiving-xml-parser";
import { parseContent } from "../util";

export const contentAdapter: IMkMpXmlContentParseAdapter = {
    parse(content: string, node?: FxNode): MkXmlContent[] {
        return parseContent(
            content,
            node
                ? ((node.type as unknown) as MkXmlParseMessagePosition)
                : undefined,
            node
        );
    },
};
