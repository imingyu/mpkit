export const TAG_HEAD_NOT_EQUAL_FOOTER = "标签头部名称与尾部名称不一致";
export const TAG_HEAD_NOT_CLOSE = "标签头部未闭合";
export const TAG_HEAD_HAS_WRONG =
    "标签头部存在异常，可能存在非法字符如“<“，”>”等";
export const TAG_FOOTER_NOT_CLOSE = "标签尾部未闭合";
export const TAG_FOOTER_HAS_WRONG =
    "标签尾部语法错误，可能存在非法字符如“<“，”>”等";
export const TAG_NOT_CLOSE = "标签未闭合";
export const TAG_HAS_ILLEGAL_CHAR =
    "标签头部/尾部存在非法字符（如空格或换行等）";
export const BRACKET_THAN_TWO = {
    code: 100,
    message: "括号表达式语法错误：含有多个“{”",
};
export const BRACKET_NOT_CLOSE = {
    code: 101,
    message: "括号表达式语法错误：未闭合，缺少“}}”",
};
export const ATTR_CONTENT_HAS_MORE_VAR = {
    code: 102,
    message: "属性值中的存在多个括号表达式",
};
export const PARSE_PARAMS_WRONG = {
    code: 103,
    message: "adapter参数有误，无法解析",
};
export const ATTR_CONTENT_ONLY_DYNAMIC = {
    code: 104,
    message: "解析器规定属性内容只能存在动态内容（{{xxx}}），而当前属性",
};
export const ATTR_NOT_NAME = "属性没有名称";
export const ATTR_NAME_WRONG = "属性名称错误";
export const ATTR_WHERE_NOT_IF = "条件表达式语法错误：缺少“if”语句";

export const ATTR_KEY_CONTENT_HAS_BRAKET = "key属性值中的存在括号表达式";
export const ATTR_FOR_ITEM_NOT_FOR =
    "for-item属性仅应与for属性一同存在，此时缺少for属性";
export const ATTR_FOR_INDEX_NOT_FOR =
    "for-index属性仅应与for属性一同存在，此时缺少for属性";
export const ATTR_FOR_NOT_LISTVAR = "for属性值无可遍历变量或语法错误";
export const ATTR_FOR_VAR_EQUAL =
    "for语法中的list/item/index中存在重复的变量名";
export const ATTR_FOR_EACH_VAR_WRONG =
    "for属性值语法错误，存在“in”却无可遍历变量";
