export type MkMap<T> = {
    [prop: string]: T;
};
export type MkEnumMap<E extends string, T> = {
    [prop in E]: T;
};

export type MkMaybe<T> = T | undefined;
