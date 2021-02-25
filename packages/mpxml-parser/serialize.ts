import { MkMpXmlSerializeOptions, MkXmlNodeJSON } from "@mpkit/types";
import { serialize as fxSerialize } from "forgiving-xml-parser";

export const serialize = (
    node: MkXmlNodeJSON | MkXmlNodeJSON[],
    options?: MkMpXmlSerializeOptions
): string => {
    return fxSerialize(node, options);
};
