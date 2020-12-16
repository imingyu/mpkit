import { MkXmlParseMessage } from "@mpkit/types";
import { merge } from "@mpkit/util";

export default (data: MkXmlParseMessage) => {
    const err = data instanceof Error ? data : new Error(data.message);
    merge(err, data);
    throw data;
};
