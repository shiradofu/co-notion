export type Assert<T extends true> = T;
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T,
>() => T extends Y ? 1 : 2
  ? true
  : false;

export type Method<T, A extends unknown[], R> = (this: T, ...args: A) => R;
export type AsyncMethod<T, A extends unknown[], R> = (
  this: T,
  ...args: A
) => Promise<R>;
export type SyncMethod<
  T,
  A extends unknown[],
  R,
  F = (this: T, ...args: A) => R,
> = F extends (this: T, ...args: A) => Promise<unknown> ? never : F;

export type Primitive = boolean | string | number;

export type Arrayable<T> = T | T[];
export type Promisable<T> = T | Promise<T>;
export type Nullable<T> = T | null | undefined;

export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>;
    }
  : T;

export type TupleN<
  T,
  N extends number,
  R extends unknown[] = [],
> = R["length"] extends N ? R : TupleN<T, N, [...R, T]>;
