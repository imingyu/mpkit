import { MkXmlParseMessage } from "@mpkit/types";

export default (data: MkXmlParseMessage) => {
    const err = data instanceof Error ? data : new Error(data.message);
    Object.assign(err, data);
    throw data;
};
