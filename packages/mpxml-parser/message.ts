export const BRACKET_THAN_TWO = {
    code: 100,
    message: "括号表达式语法错误：“{”数量超出规定（2）",
};
export const BRACKET_NOT_CLOSE = {
    code: 101,
    message: "括号表达式语法错误：未闭合",
};
export const ATTR_CONTENT_HAS_MORE_VAR = {
    code: 102,
    message: "属性值中的存在多个括号表达式",
};
export const ADAPTER_PARAMS_WRONG = {
    code: 103,
    message: "adapter参数有误，无法解析",
};
export const ATTR_CONTENT_ONLY_DYNAMIC = {
    code: 104,
    message: "解析器规定属性内容只能存在动态内容（{{xxx}}），而当前属性",
};
export const XMLJSON_PARAMS_WRONG = {
    code: 105,
    message: "xmlJSON参数为空，无法解析",
};
export const ATTR_WHERE_NOT_IF = {
    code: 106,
    message: "条件表达式语法错误：缺少“if”语句",
};
export const ATTR_ELSE_HAS_CONTENT = {
    code: 107,
    message: "else表达式语法错误：不应存在内容",
};
export const ATTR_FOR_ITEM_NOT_FOR = {
    code: 108,
    message: "for-item属性仅应与for属性一同存在，此时缺少for属性",
};
export const ATTR_FOR_INDEX_NOT_FOR = {
    code: 109,
    message: "for-index属性仅应与for属性一同存在，此时缺少for属性",
};
