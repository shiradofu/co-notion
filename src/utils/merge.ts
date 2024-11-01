function isSameType<T>(x: unknown, y: T): x is T {
  return (
    typeof x === typeof y &&
    (x === null) === (y === null) &&
    Array.isArray(x) === Array.isArray(y)
  );
}

type Obj = Record<string | number, unknown>;
export function merge(shouldBeUpdated: Obj, base: Obj) {
  for (const k of Object.keys(base)) {
    if (
      !(k in shouldBeUpdated) ||
      shouldBeUpdated[k] === null ||
      shouldBeUpdated[k] === undefined ||
      !isSameType(shouldBeUpdated[k], base[k])
    ) {
      shouldBeUpdated[k] = base[k];
      continue;
    }

    if (
      typeof shouldBeUpdated[k] !== "object" ||
      Array.isArray(shouldBeUpdated[k])
    ) {
      continue;
    }

    merge(shouldBeUpdated[k] as Obj, base[k] as Obj);
  }

  for (const k of Object.keys(shouldBeUpdated)) {
    if (!(k in base)) delete shouldBeUpdated[k];
  }
}
