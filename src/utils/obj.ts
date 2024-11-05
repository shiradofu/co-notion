export type Obj = Record<string | number, unknown>;

export function getObjValueByCtx<T = unknown>(
  obj: Obj,
  ctx: string[],
): T | undefined {
  const k = ctx.at(0);
  if (!k || !(k in obj)) return undefined;
  const v = obj[k];
  return ctx.length === 1 ? (v as T) : getObjValueByCtx(v as Obj, ctx.slice(1));
}
