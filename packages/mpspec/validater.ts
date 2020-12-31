import {
    MkMpXmlAstAttr,
    MkMpXmlAstElement,
    MkMpXmlAstPreviousSiblingFinder,
    MkMpXmlNodeValidater,
    MkMpXmlNodeValidateResult,
    MkMpXmlNodeValidateResultLevel,
} from "@mpkit/types";

const hasAttr = (node: MkMpXmlAstElement, ...attrNames: string[]): boolean => {
    return node.attrs.some((attr) => attrNames.indexOf(attr.name) !== -1);
};

const code = (type: string, code: number) => `MK:${type || ""}:${code}`;

export const attrElifValidater = (ifAttrName: string): MkMpXmlNodeValidater => {
    return (
        attr: MkMpXmlAstAttr,
        parent: MkMpXmlAstElement,
        grandpa?: MkMpXmlAstElement,
        previousSiblingFinder?: MkMpXmlAstPreviousSiblingFinder
    ): MkMpXmlNodeValidateResult => {
        let warn = !attr.content;
        let message = warn ? "content is empty" : "";
        let pass = true;
        let cd = warn ? 1 : 0;
        let level = warn
            ? MkMpXmlNodeValidateResultLevel.warn
            : MkMpXmlNodeValidateResultLevel.success;
        if (grandpa) {
            const parentPrevElement =
                grandpa.previousSibling ||
                previousSiblingFinder(parent, grandpa.children);
            if (!parentPrevElement) {
                pass = false;
                level = MkMpXmlNodeValidateResultLevel.fail;
                message = "not find previousSibling";
                cd = 2;
            } else {
                level = hasAttr(parentPrevElement, ifAttrName)
                    ? level
                    : MkMpXmlNodeValidateResultLevel.fail;
                if (level === MkMpXmlNodeValidateResultLevel.fail) {
                    pass = false;
                    message = `not find "${ifAttrName}" attr`;
                    cd = 3;
                }
            }
        }
        return {
            pass,
            level,
            code: code("ATTR_ELIF", cd),
            message,
        } as MkMpXmlNodeValidateResult;
    };
};

export const attrElseValidater = (
    ifAttrName: string,
    elifAttrName: string
): MkMpXmlNodeValidater => {
    return (
        attr: MkMpXmlAstAttr,
        parent: MkMpXmlAstElement,
        grandpa?: MkMpXmlAstElement,
        previousSiblingFinder?: MkMpXmlAstPreviousSiblingFinder
    ): MkMpXmlNodeValidateResult => {
        let warn = "content" in attr;
        let message = warn ? '"else" attr has content' : "";
        let pass = true;
        let cd = warn ? 1 : 0;
        let level = warn
            ? MkMpXmlNodeValidateResultLevel.warn
            : MkMpXmlNodeValidateResultLevel.success;
        if (grandpa) {
            const parentPrevElement =
                grandpa.previousSibling ||
                previousSiblingFinder(parent, grandpa.children);
            if (!parentPrevElement) {
                pass = false;
                level = MkMpXmlNodeValidateResultLevel.fail;
                message = "not find previousSibling";
                cd = 2;
            } else {
                level = hasAttr(parentPrevElement, ifAttrName, elifAttrName)
                    ? level
                    : MkMpXmlNodeValidateResultLevel.fail;
                if (level === MkMpXmlNodeValidateResultLevel.fail) {
                    pass = false;
                    message = `not find "${elifAttrName}" or "${ifAttrName}" attr`;
                    cd = 3;
                }
            }
        }
        return {
            pass,
            level,
            code: code("ATTR_ELSE", cd),
            message,
        } as MkMpXmlNodeValidateResult;
    };
};

export const attrForValidater = (forAttrName: string): MkMpXmlNodeValidater => {
    return (
        attr: MkMpXmlAstAttr,
        parent: MkMpXmlAstElement
    ): MkMpXmlNodeValidateResult => {
        let warn = !attr.content;
        let message = warn ? "content is empty" : "";
        let pass = true;
        let cd = warn ? 1 : 0;
        let level = warn
            ? MkMpXmlNodeValidateResultLevel.warn
            : MkMpXmlNodeValidateResultLevel.success;
        level = hasAttr(parent, forAttrName)
            ? level
            : MkMpXmlNodeValidateResultLevel.fail;
        if (level === MkMpXmlNodeValidateResultLevel.fail) {
            pass = false;
            message = `not find "${forAttrName}" attr`;
            cd = 2;
        }
        return {
            pass,
            level,
            code: code("ATTR_FOR", cd),
            message,
        } as MkMpXmlNodeValidateResult;
    };
};
