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
