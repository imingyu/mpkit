import { MkValidateMessage } from "@mpkit/types";
import { merge } from "@mpkit/util";

export default (data: MkValidateMessage) => {
    const err = new Error(data.message) as MkValidateMessage;
    merge(err, data);
    throw err;
};
