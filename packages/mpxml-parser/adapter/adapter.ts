import {
    MkMap,
    IParseAttrAdapter,
    IParseContentAdapter,
    IParseElementAdapter,
    MkXmlContent,
    MpPlatform,
    IMpParseAdapter,
    IMpParseAttrAdapter,
    MkXmlNode,
    MkParseElementAdapterArg,
} from "@mpkit/types";
import { parseContent } from "../util";
import { FxNodeType } from "forgiving-xml-parser";

export abstract class ParseElementAdapterImpl implements IParseElementAdapter {
    attrAdapters: MkMap<IParseAttrAdapter>;
    contentAdapter: IParseContentAdapter;
    constructor(
        attrAdapters: MkMap<IParseAttrAdapter>,
        contentAdapter: IParseContentAdapter
    ) {
        this.attrAdapters = attrAdapters;
        this.contentAdapter = contentAdapter;
    }
    parse(data: MkParseElementAdapterArg): MkXmlNode {
        const {
            currentElement,
            currentElementIndex,
            brotherElements,
            allElements,
            xml,
        } = data;
        if (currentElement.type === FxNodeType.element) {
            let attrs;
            if (currentElement.attrs) {
                const commonAttr = this.attrAdapters["*"];
                const unclaimedAttr = this.attrAdapters.unclaimed;
                attrs = currentElement.attrs.map((item, index, arr) => {
                    let resultAttr: MkXmlNode;
                    const currentAttr = this.attrAdapters[item.name];
                    if (currentAttr) {
                        resultAttr = currentAttr.parse({
                            currentElement,
                            currentElementIndex,
                            brotherElements,
                            allElements,
                            xml,
                            currentAttr: item,
                            allAttrs: arr,
                        });
                    } else if (unclaimedAttr) {
                        resultAttr = unclaimedAttr.parse({
                            currentElement,
                            currentElementIndex,
                            brotherElements,
                            allElements,
                            xml,
                            currentAttr: item,
                            allAttrs: arr,
                            prevParseAttr: resultAttr,
                        });
                    }
                    if (commonAttr) {
                        resultAttr = commonAttr.parse({
                            currentElement,
                            currentElementIndex,
                            brotherElements,
                            allElements,
                            xml,
                            currentAttr: item,
                            allAttrs: arr,
                            prevParseAttr: resultAttr,
                        });
                    }
                    if (!resultAttr) {
                        resultAttr = (item as unknown) as MkXmlNode;
                        if (item.content && item.content.trim()) {
                            try {
                                resultAttr.content = this.contentAdapter.parse(
                                    item.content
                                );
                            } catch (error) {
                                // const err = error as MkValidateMessage;
                                // err.position = MkValidateMessagePosition.attr;
                                // err.target = resultAttr;
                                // throw err;
                            }
                        }
                    }

                    return resultAttr;
                });
            }
            const result = (currentElement as unknown) as MkXmlNode;
            if (attrs) {
                result.attrs = attrs;
            }
            return result;
        }
        if (
            currentElement.type === FxNodeType.text &&
            currentElement.content &&
            currentElement.content.trim()
        ) {
            const result = (currentElement as unknown) as MkXmlNode;
            try {
                const content = this.contentAdapter.parse(
                    currentElement.content
                );
                result.content = content;
            } catch (error) {
                // const err = error as MkValidateMessage;
                // err.position = MkValidateMessagePosition.content;
                // err.target = result;
                // throw err;
            }
            return result;
        }
        return (currentElement as unknown) as MkXmlNode;
    }
}

export class MpParseElementAdapter
    extends ParseElementAdapterImpl
    implements IMpParseAdapter {
    mpPlatform: MpPlatform;
    constructor(
        mpPlatform: MpPlatform,
        attrAdapters: MkMap<IMpParseAttrAdapter>,
        contentAdapter: IParseContentAdapter
    ) {
        super(attrAdapters, contentAdapter);
        this.mpPlatform = mpPlatform;
    }
}

export abstract class ParseContentAdapterImpl implements IParseContentAdapter {
    parse(content: string): MkXmlContent[] {
        return parseContent(content);
    }
}

export class MpParseContentAdapter
    extends ParseContentAdapterImpl
    implements IMpParseAdapter {
    mpPlatform: MpPlatform;
    constructor(mpPlatform: MpPlatform) {
        super();
        this.mpPlatform = mpPlatform;
    }
}
