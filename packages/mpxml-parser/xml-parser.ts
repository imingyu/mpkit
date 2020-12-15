import { FxParser } from "forgiving-xml-parser";
export const FvXmlParser = new FxParser({
    parseOptions: {
        allowNodeNameEmpty: false,
        allowAttrContentHasBr: false,
        allowEndTagBoundaryNearSpace: false,
        allowNodeNotClose: false,
        allowStartTagBoundaryNearSpace: false,
        allowTagNameHasSpace: false,
    },
});
