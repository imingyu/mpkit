import {
    FxNodeAdapter,
    FxNodeCloseType,
    FxNodeType,
    FxTryStep,
    MkMpXmlTranslater,
    MkXmlNode,
    MkXmlNodeJSON,
    MpForAttrContent,
    MpPlatform,
    MpXmlContentType,
} from "@mpkit/types";
import { MkTranslateAdapter } from "@mpkit/types";
import { mpViewSyntaxSpec } from "@mpkit/mpxml-parser";
import { reolaceFileSuffix } from "@mpkit/util";

export const createMpTranslateAdapters = (): MkTranslateAdapter[] => {
    return [
        createMpTranslateAdapter(MpPlatform.wechat, MpPlatform.alipay),
        createMpTranslateAdapter(MpPlatform.wechat, MpPlatform.smart),
        createMpTranslateAdapter(MpPlatform.wechat, MpPlatform.tiktok),

        createMpTranslateAdapter(MpPlatform.alipay, MpPlatform.wechat),
        createMpTranslateAdapter(MpPlatform.alipay, MpPlatform.smart),
        createMpTranslateAdapter(MpPlatform.alipay, MpPlatform.tiktok),

        createMpTranslateAdapter(MpPlatform.smart, MpPlatform.wechat),
        createMpTranslateAdapter(MpPlatform.smart, MpPlatform.alipay),
        createMpTranslateAdapter(MpPlatform.smart, MpPlatform.tiktok),

        createMpTranslateAdapter(MpPlatform.tiktok, MpPlatform.wechat),
        createMpTranslateAdapter(MpPlatform.tiktok, MpPlatform.alipay),
        createMpTranslateAdapter(MpPlatform.tiktok, MpPlatform.smart),
    ];
};

const pikeNodeProps = (
    source: MkXmlNodeJSON,
    target: MkXmlNodeJSON,
    props: string[]
) => {
    props.forEach((prop) => {
        if (prop in source) {
            if (typeof source[prop] === "object") {
                target[prop] = JSON.parse(JSON.stringify(source[prop]));
            } else {
                target[prop] = source[prop];
            }
        }
    });
};

export const cloneNode = (
    node: MkXmlNodeJSON,
    cloneAttr?: boolean,
    deep?: boolean
): MkXmlNodeJSON => {
    const res: MkXmlNodeJSON = {
        type: node.type,
    };
    pikeNodeProps(node, res, [
        "name",
        "customType",
        "closeType",
        "content",
        "locationInfo",
        "boundaryChar",
        "equalCount",
        "nature",
    ]);
    if (node.steps) {
        res.steps = node.steps.map((item) => {
            const step: FxTryStep = {
                step: item.step,
                cursor: item.cursor,
            };
            if (Array.isArray(item.data)) {
                step.data = (item.data as [FxNodeAdapter, FxNodeCloseType]).map(
                    (d) => d
                ) as [FxNodeAdapter, FxNodeCloseType];
            } else if (item.data) {
                step.data = item.data;
            }
            return step;
        });
    }

    if (node.mpContents) {
        res.mpContents = JSON.parse(JSON.stringify(node.mpContents));
    }
    if (cloneAttr && node.attrs) {
        res.attrs = node.attrs.map((item) => cloneNode(item));
    }
    if (deep && node.children) {
        res.children = node.children.map((item, index) => cloneNode(item));
    }
    return res;
};

const ATTR_PROPS = [
    "for",
    "forItem",
    "forIndex",
    "key",
    "if",
    "elseIf",
    "else",
];
const mpSpecialAttrNames: { [prop in MpPlatform]?: Array<string> } = {};
const getMpSpecialAttrNames = (platform: MpPlatform): string[] => {
    if (!mpSpecialAttrNames[platform]) {
        const spec = mpViewSyntaxSpec[platform];
        mpSpecialAttrNames[platform] = ATTR_PROPS.map((prop) => {
            return spec.namespace + spec[prop];
        }) as string[];
    }
    return mpSpecialAttrNames[platform];
};
const splitString = (str: string, char: string): string[] => {
    return str.split(char).map((item) => item.trim());
};
export const parseSmartForAttrContent = (content: string): MpForAttrContent => {
    // 百度小程序语法：s-for="item,index in list trackBy index"
    const forAttrContent: MpForAttrContent = {
        type: MpXmlContentType.dynamic,
        value: content,
    };
    const [valMain, valKey] = splitString(content, "trackBy");
    if (valKey) {
        forAttrContent.featureKey = valKey;
    }
    if (valMain.indexOf(" in ") !== -1) {
        const [eachVar, listVar] = splitString(valMain, " in ");
        if (listVar) {
            forAttrContent.featureList = listVar;
            const [name, index] = splitString(eachVar, ",");
            if (name) {
                forAttrContent.featureItem = name;
            }
            if (index) {
                forAttrContent.featureIndex = index;
            }
        }
    } else {
        forAttrContent.featureList = valMain;
    }
    return forAttrContent;
};

const translateBindEventAttr = (
    attr: MkXmlNodeJSON,
    targetNode: MkXmlNodeJSON,
    sourcePlatform: MpPlatform,
    targetPlatform: MpPlatform
) => {
    let bindMode: string;
    if (attr.name.startsWith("catch")) {
        bindMode = "catch";
    } else if (sourcePlatform === MpPlatform.alipay) {
        if (attr.name.startsWith("on")) {
            bindMode = "on";
        }
    } else {
        if (attr.name.startsWith("bind")) {
            bindMode = "bind";
        } else if (
            sourcePlatform === MpPlatform.wechat ||
            sourcePlatform === MpPlatform.smart
        ) {
            if (attr.name.startsWith("capture-bind")) {
                bindMode = "capture-bind";
            } else if (attr.name.startsWith("capture-catch")) {
                bindMode = "capture-catch";
            } else if (
                sourcePlatform === MpPlatform.wechat &&
                attr.name.startsWith("mut-bind")
            ) {
                bindMode = "mut-bind";
            }
        }
    }
    if (bindMode) {
        let targetEventName = attr.name.substr(bindMode.length);
        targetEventName =
            sourcePlatform === MpPlatform.alipay
                ? targetEventName.toLowerCase()
                : targetEventName.startsWith(":")
                ? targetEventName.substr(1)
                : targetEventName;
        if (sourcePlatform === MpPlatform.alipay) {
            // 支付宝向其他平台转换，其他平台的事件系统均支持bind和catch
            attr.name = `${
                bindMode === "on" ? "bind" : bindMode
            }${targetEventName}`;
            return;
        }
        if (targetPlatform === MpPlatform.alipay) {
        }
        if (bindMode.startsWith("capture")) {
            // capture-xxx只有微信和百度支持
        }
    }
};

export const createMpTranslateAdapter = <T = any>(
    sourcePlatform: MpPlatform,
    targetPlatform: MpPlatform
): MkTranslateAdapter<T> => {
    const sourceSpecicalAttrs = getMpSpecialAttrNames(sourcePlatform);
    const [
        sourceFor,
        sourceForItem,
        sourceForIndex,
        sourceKey,
        sourceIf,
        sourceElseIf,
        sourceElse,
    ] = sourceSpecicalAttrs;
    const targetSpecicalAttrs = getMpSpecialAttrNames(targetPlatform);
    const [
        targetFor,
        targetForItem,
        targetForIndex,
        targetKey,
        targetIf,
        targetElseIf,
        targetElse,
    ] = targetSpecicalAttrs;
    const sourceViewSpec = mpViewSyntaxSpec[sourcePlatform];
    const targetViewSpec = mpViewSyntaxSpec[targetPlatform];
    const match = (_sourcePlatform: MpPlatform, _targetPlatform: MpPlatform) =>
        _sourcePlatform === sourcePlatform &&
        _targetPlatform === targetPlatform;
    const translater: MkMpXmlTranslater<T> = (
        node: MkXmlNodeJSON,
        options?: T
    ): MkXmlNodeJSON => {
        const targetNode: MkXmlNodeJSON = cloneNode(node, true);
        let isXjsNode;
        if (targetNode.name === sourceViewSpec.xjsNodeName) {
            isXjsNode = true;
            targetNode.name = targetViewSpec.xjsNodeName;
        }
        let isImportNode;
        if (targetNode.name === sourceViewSpec.importNodeName) {
            isImportNode = true;
            targetNode.name = targetViewSpec.importNodeName;
        }
        let isIncludeNode;
        if (targetNode.name === sourceViewSpec.includeNodeName) {
            isIncludeNode = true;
            targetNode.name = targetViewSpec.includeNodeName;
        }
        type NodeIndex = [number, MkXmlNodeJSON];
        if (targetNode.attrs) {
            const specicalAttrs: Array<NodeIndex> = [];
            let forKeyAttrIndex: number = -1;
            targetNode.attrs.forEach((attr, attrIndex) => {
                if (attr.name) {
                    if (isXjsNode) {
                        if (attr.name === sourceViewSpec.xjsModuleAttrName) {
                            attr.name = targetViewSpec.xjsModuleAttrName;
                        } else if (
                            attr.name === sourceViewSpec.xjsSrcAttrName
                        ) {
                            attr.name = targetViewSpec.xjsSrcAttrName;
                            if (attr.content) {
                                attr.content = reolaceFileSuffix(
                                    attr.content,
                                    targetViewSpec.xjsFileSuffix
                                );
                            }
                        }
                    }
                    if (
                        isImportNode &&
                        attr.name === sourceViewSpec.importSrcAttrName
                    ) {
                        attr.name = targetViewSpec.importSrcAttrName;
                        if (attr.content) {
                            attr.content = reolaceFileSuffix(
                                attr.content,
                                targetViewSpec.xmlFileSuffix
                            );
                        }
                    }
                    if (
                        isIncludeNode &&
                        attr.name === sourceViewSpec.includeSrcAttrName
                    ) {
                        attr.name = targetViewSpec.includeSrcAttrName;
                        if (attr.content) {
                            attr.content = reolaceFileSuffix(
                                attr.content,
                                targetViewSpec.xmlFileSuffix
                            );
                        }
                    }

                    // 转换事件
                    translateBindEventAttr(
                        attr,
                        targetNode,
                        sourcePlatform,
                        targetPlatform
                    );

                    let specicalAttrIndex: number = -1;
                    if (
                        (specicalAttrIndex = sourceSpecicalAttrs.indexOf(
                            attr.name
                        )) !== -1
                    ) {
                        specicalAttrs.push([specicalAttrIndex, attr]);
                        if (sourceKey && attr.name === sourceKey) {
                            forKeyAttrIndex = attrIndex;
                        }
                    }
                }
            });
            if (specicalAttrs.length) {
                specicalAttrs.forEach(([specicalAttrNameIndex, attr]) => {
                    if (attr.name === sourceFor && attr.content) {
                        // 转换for属性
                        attr.name = targetSpecicalAttrs[specicalAttrNameIndex];
                        if (targetPlatform === MpPlatform.smart) {
                            let forKeyAttr: MkXmlNodeJSON;
                            if (forKeyAttrIndex !== -1) {
                                forKeyAttr = targetNode.attrs.splice(
                                    forKeyAttrIndex,
                                    1
                                )[0];
                            }
                            let trackBy: string = "";
                            if (forKeyAttr && forKeyAttr.content) {
                                trackBy += ` trackBy ${forKeyAttr.content}`;
                            }
                            let forVarAppendBrcket;
                            attr.content = (attr.mpContents as MpForAttrContent[])
                                .map((item) => {
                                    if (
                                        item.type === MpXmlContentType.dynamic
                                    ) {
                                        return item.value;
                                    }
                                    if (item.value.trim()) {
                                        forVarAppendBrcket = true;
                                        if (
                                            parseFloat(item.value.trim()) +
                                                "" ===
                                            item.value.trim()
                                        ) {
                                            return ` + ${item.value.trim()} + `;
                                        }
                                    }
                                    return ` + '${item.value}'`;
                                })
                                .join("");
                            if (forVarAppendBrcket) {
                                attr.content = `(${attr.content})`;
                            }
                            if (trackBy) {
                                attr.content += trackBy;
                            }
                            return;
                        }
                        if (sourcePlatform === MpPlatform.smart) {
                            const attrContent = parseSmartForAttrContent(
                                attr.content
                            );
                            let forItemAttr = targetNode.attrs.find(
                                (item) =>
                                    item.name ===
                                    (sourceForItem || targetForItem)
                            );
                            if (forItemAttr) {
                                forItemAttr.content =
                                    attrContent.featureItem ||
                                    forItemAttr.content;
                            } else if (attrContent.featureItem) {
                                targetNode.attrs.push({
                                    type: FxNodeType.attr,
                                    name: targetForItem,
                                    content: attrContent.featureItem,
                                });
                            }
                            const forIndexAttr = targetNode.attrs.find(
                                (item) =>
                                    item.name ===
                                    (sourceForIndex || targetForIndex)
                            );
                            if (forIndexAttr) {
                                forIndexAttr.content =
                                    attrContent.featureIndex ||
                                    forIndexAttr.content;
                            } else if (attrContent.featureIndex) {
                                targetNode.attrs.push({
                                    type: FxNodeType.attr,
                                    name: targetForIndex,
                                    content: attrContent.featureIndex,
                                });
                            }
                            const forKeyAttr =
                                sourceKey || targetKey
                                    ? targetNode.attrs.find(
                                          (item) =>
                                              item.name ===
                                              (sourceKey || targetKey)
                                      )
                                    : null;
                            if (forKeyAttr) {
                                forKeyAttr.content =
                                    attrContent.featureKey ||
                                    forKeyAttr.content;
                            } else if (attrContent.featureKey) {
                                targetNode.attrs.push({
                                    type: FxNodeType.attr,
                                    name: targetKey,
                                    content: attrContent.featureKey,
                                });
                            }
                            return;
                        }
                        return;
                    }

                    if (
                        (attr.name === sourceIf ||
                            attr.name === sourceElseIf) &&
                        attr.content
                    ) {
                        attr.name = targetSpecicalAttrs[specicalAttrNameIndex];
                        if (targetPlatform === MpPlatform.smart) {
                            let appendBrcket;
                            attr.content = (attr.mpContents as MpForAttrContent[])
                                .map((item) => {
                                    if (
                                        item.type === MpXmlContentType.dynamic
                                    ) {
                                        return item.value;
                                    }
                                    if (item.value.trim()) {
                                        appendBrcket = true;
                                        if (
                                            parseFloat(item.value.trim()) +
                                                "" ===
                                            item.value.trim()
                                        ) {
                                            return ` + ${item.value.trim()} + `;
                                        }
                                    }
                                    return ` + '${item.value}'`;
                                })
                                .join("");
                            if (appendBrcket) {
                                attr.content = `(${attr.content})`;
                            }
                            return;
                        }
                        if (sourcePlatform === MpPlatform.smart) {
                            attr.content = `{{${attr.content}}}`;
                            return;
                        }
                    }
                    // 将名称转换为目标平台
                    if (targetSpecicalAttrs[specicalAttrNameIndex]) {
                        attr.name = targetSpecicalAttrs[specicalAttrNameIndex];
                    }
                });
            }
        }
        if (node.children) {
            targetNode.children = node.children.map((item) => {
                return translater(item, options);
            });
        }
        return targetNode;
    };
    return {
        match,
        translater,
    };
};
