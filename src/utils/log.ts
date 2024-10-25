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
