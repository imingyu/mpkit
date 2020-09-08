export type MkMap<T> = {
    [prop: string]: T;
};
export type MkEnumMap<E extends string, T> = {
    [prop in E]: T;
};
export type MkPick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type MkExclude<T, U> = T extends U ? never : T;
export type MkOmit<T, K extends keyof any> = MkPick<T, MkExclude<keyof T, K>>;
export type MkMaybe<T> = T | undefined;
