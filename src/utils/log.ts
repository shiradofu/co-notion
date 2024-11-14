import { extName } from "./constants";
import type { AsyncMethod, Method, SyncMethod } from "./types";

const LOG_PREFIX = `[${extName}]`;

export class Log {
  constructor(private ctx: string) {}

  static err(...data: unknown[]) {
    console.error(LOG_PREFIX, ...data);
  }

  static dbg(...data: unknown[]) {
    process.env.NODE_ENV === "development" && console.log(LOG_PREFIX, ...data);
  }

  static thrown(...data: unknown[]) {
    if (data.find((d) => d instanceof Error)) {
      Log.err(...data);
    } else {
      Log.dbg(...data);
    }
  }

  static thrownInMethodSync<T, A extends unknown[], R>(
    target: SyncMethod<T, A, R>,
    meta: ClassMethodDecoratorContext<T, Method<T, A, R>>,
  ) {
    return function (this: T, ...args: A) {
      const className = getClassNameFromThis(this);
      const ctxStr = className
        ? `${className}.${String(meta.name)}`
        : String(meta.name);
      try {
        if (typeof target === "function") {
          return target.call(this, ...args);
        }
      } catch (e) {
        Log.thrown(Log.makePrefix(ctxStr), e);
      }
    };
  }

  static thrownInMethodAsync<T, A extends unknown[], R>(
    target: AsyncMethod<T, A, R>,
    meta: ClassMethodDecoratorContext<T, AsyncMethod<T, A, R>>,
  ) {
    return async function (this: T, ...args: A) {
      const className = getClassNameFromThis(this);
      const ctxStr = className
        ? `${className}.${String(meta.name)}`
        : String(meta.name);
      return await target.call(this, ...args).catch((e: unknown) => {
        Log.thrown(Log.makePrefix(ctxStr), e);
      });
    };
  }

  static makePrefix(base: string) {
    return `(${base}) `;
  }

  err(...data: unknown[]) {
    Log.err(this.prefix, ...data);
  }

  dbg(...data: unknown[]) {
    Log.dbg(this.prefix, ...data);
  }

  thrown(...data: unknown[]) {
    Log.thrown(this.prefix, ...data);
  }

  local(additionalCtx: string) {
    return new Log(`${this.ctx}${additionalCtx}`);
  }

  private get prefix() {
    return Log.makePrefix(this.ctx);
  }
}

function getClassNameFromThis(t: unknown) {
  return typeof t === "object" &&
    t !== null &&
    "constructor" in t &&
    typeof t.constructor === "function" &&
    t.constructor &&
    "name" in t.constructor &&
    typeof t.constructor.name === "string"
    ? t.constructor.name
    : undefined;
}
