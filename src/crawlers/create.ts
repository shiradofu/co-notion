import type { TupleN } from "../utils/types";

export type Auxiliary = "must" | "may";

const INTERVAL_AND_TIMEOUT = {
  long: [300, 30 * 1000], // initial loading
  short: [10, 5 * 1000], // after clicking or so
} as const;

type WaitDuration = keyof typeof INTERVAL_AND_TIMEOUT;

type CrawlerFnOptsBase<R> = {
  isSuccessFn?: (result: R) => boolean;
  errMsg?: string | false;
};

type CrawlerFnOpts<T extends unknown[], R> = T extends []
  ? CrawlerFnOptsBase<R>
  : TupleN<undefined, T["length"]> extends T
    ? CrawlerFnOptsBase<R> & { args?: T }
    : CrawlerFnOptsBase<R> & { args: T };

type CrawlerFnOptsWithWait<T extends unknown[], R> = CrawlerFnOpts<T, R> & {
  wait: WaitDuration;
  shouldFinishFn?: (result: R) => boolean;
};

export type CrawlerFn = ReturnType<typeof createCrawlerFn>;
export function createCrawlerFn<
  E extends unknown[],
  T extends [...E, ...unknown[]],
  R,
>(
  fn: (...args: T) => R,
  baseErrMsg: string | ((...args: E) => string),
  baseOpts?: {
    isSuccessFn?: (result: R) => boolean;
    shouldFinishFn?: (result: R) => boolean;
  },
) {
  function crawlerFn(opts?: CrawlerFnOpts<T, R>): R;
  function crawlerFn(
    auxiliary: Auxiliary | undefined,
    opts?: CrawlerFnOpts<T, R>,
  ): NonNullable<R>;
  function crawlerFn(opts: CrawlerFnOptsWithWait<T, R>): Promise<R | null>;
  function crawlerFn(
    auxiliary: Auxiliary | undefined,
    opts: CrawlerFnOptsWithWait<T, R>,
  ): Promise<NonNullable<R>>;
  function crawlerFn(
    auxiliaryOrOpts?:
      | Auxiliary
      | CrawlerFnOpts<T, R>
      | CrawlerFnOptsWithWait<T, R>,
    optsOrUndefined?: CrawlerFnOpts<T, R> | CrawlerFnOptsWithWait<T, R>,
  ): R | NonNullable<R> | Promise<R | null> | Promise<NonNullable<R>> {
    const auxiliary =
      typeof auxiliaryOrOpts === "string" ? auxiliaryOrOpts : null;
    const opts = (
      typeof auxiliaryOrOpts === "string" ? optsOrUndefined : auxiliaryOrOpts
    ) as CrawlerFnOpts<T, R> | CrawlerFnOptsWithWait<T, R> | undefined;
    const args = (opts && "args" in opts ? opts?.args : []) as T;
    const isSuccessFn =
      opts?.isSuccessFn ?? baseOpts?.isSuccessFn ?? ((result) => !!result);
    const errMsg =
      opts?.errMsg === false
        ? false
        : `${
            typeof baseErrMsg === "string"
              ? baseErrMsg
              : // biome-ignore lint: suspicious/noExplicitAny
                baseErrMsg(...(args as any))
          }${opts?.errMsg ? opts.errMsg : ""}`;

    let result:
      | R
      | NonNullable<R>
      | Promise<R | null>
      | Promise<NonNullable<R>>;

    if (opts && "wait" in opts) {
      const shouldFinishFn =
        opts.shouldFinishFn ?? baseOpts?.shouldFinishFn ?? isSuccessFn;
      const [interval, timeout] = INTERVAL_AND_TIMEOUT[opts.wait];

      return new Promise<R | null>((resolve) => {
        let n = 0;
        const maxRetry = timeout / interval;
        const tid = setInterval(async () => {
          if (n > maxRetry) {
            clearInterval(tid);
            if (auxiliary && errMsg) {
              throw auxiliary === "must" ? new Error(errMsg) : errMsg;
            }
            resolve(null);
          }

          result = fn(...args);

          if (!shouldFinishFn(result)) {
            n++;
            return;
          }

          clearInterval(tid);
          if (auxiliary && !isSuccessFn(result) && errMsg) {
            throw auxiliary === "must" ? new Error(errMsg) : errMsg;
          }
          resolve(result);
        }, interval);
      });
    }

    result = fn(...args);

    if (auxiliary && !isSuccessFn(result) && errMsg !== false) {
      throw auxiliary === "must" ? new Error(errMsg) : errMsg;
    }
    return result;
  }

  return crawlerFn;
}
