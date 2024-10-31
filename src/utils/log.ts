const LOG_PREFIX = "[notion-utils]";

export const log = {
  err: (...data: unknown[]) => console.error(LOG_PREFIX, ...data),
  dbg: (...data: unknown[]) => {
    process.env.NODE_ENV === "development" && console.log(LOG_PREFIX, ...data);
  },
  thrown: (data: unknown) => {
    if (data instanceof Error) {
      log.err(data);
    } else if (typeof data === "string") {
      log.dbg(data);
    }
  },
} as const;

export function logThrownSync<
  T,
  A extends unknown[],
  R,
  F = (this: T, ...args: A) => R,
>(
  target: F extends (this: T, ...args: A) => Promise<unknown> ? never : F,
  _ctx: ClassMethodDecoratorContext<T, (this: T, ...args: A) => R>,
) {
  return function (this: T, ...args: A) {
    try {
      if (typeof target === "function") {
        return target.call(this, ...args);
      }
    } catch (e) {
      log.thrown(e);
    }
  };
}

export function logThrownAsync<T, A extends unknown[], R>(
  target: (this: T, ...args: A) => Promise<R>,
  _ctx: ClassMethodDecoratorContext<T, (this: T, ...args: A) => Promise<R>>,
) {
  return async function (this: T, ...args: A) {
    return await target
      .call(this, ...args)
      .catch((e: unknown) => log.thrown(e));
  };
}
