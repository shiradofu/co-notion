type Arrayable<T> = T | T[];
type Promisable<T> = T | Promise<T>;
type QueryResult = Promisable<Arrayable<HTMLElement> | null | undefined>;

type ObservedFnTrigger = "manual" | "onObserve" | "onMutate" | "onResize";

export class MutationObserved {
  constructor(
    public query: (parent: HTMLElement) => QueryResult,
    public config: MutationObserverInit,
    public fn?: (element: HTMLElement, trigger: ObservedFnTrigger) => void,
  ) {}
}

export class ResizeObserved {
  constructor(
    public query: (parent: HTMLElement) => QueryResult,
    public config: ResizeObserverOptions = {},
    public fn?: (element: HTMLElement, trigger: ObservedFnTrigger) => void,
  ) {}
}

export class MutationObservedRoot {
  constructor(
    public query: () => QueryResult,
    public config: MutationObserverInit,
    public fn?: (element: HTMLElement, trigger: ObservedFnTrigger) => void,
  ) {}
}

type Observeds = (MutationObservedRoot | MutationObserved | ResizeObserved)[];

export class ObserverChain {
  private arr: [MutationObservedRoot, ...(MutationObserved | ResizeObserved)[]];

  constructor(
    ...arr: [MutationObservedRoot, ...(MutationObserved | ResizeObserved)[]]
  ) {
    this.arr = arr;
  }

  observe() {
    return Promise.all([
      this.runRecursive(this.arr),
      this.observeRecursive([...this.arr].reverse()),
    ]);
  }

  private async observeRecursive(
    reversedArr: Observeds,
    observeChildrenIn?: (observed: HTMLElement) => void,
  ) {
    const current = reversedArr.at(0);
    if (!current) return;

    const Observer = this.isMutationObserverConfig(current.config)
      ? MutationObserver
      : ResizeObserver;

    const observer = new Observer(([record]) => {
      const currentMutated = record.target;
      if (!(currentMutated instanceof HTMLElement)) return;
      if (current.fn) current.fn(currentMutated, "onMutate");
      if (observeChildrenIn) {
        observeChildrenIn(currentMutated);
      }
    });

    if (current instanceof MutationObservedRoot) {
      const rootEls = [await current.query()].flat();
      for (const root of rootEls) {
        if (!root) continue;
        observer.observe(root, current.config);
      }
      return;
    }

    this.observeRecursive(reversedArr.slice(1), async (el: HTMLElement) => {
      const currentEls = [await current.query(el)].flat();
      for (const currentEl of currentEls) {
        if (!currentEl) continue;
        if (current.fn) current.fn(currentEl, "onObserve");
        observer.observe(currentEl, current.config);
      }
    });
  }

  private async runRecursive(arr: Observeds, parent?: HTMLElement) {
    const current = arr.at(0);
    if (!current) return;

    const nextArr = arr.slice(1);

    const currentEls =
      current instanceof MutationObservedRoot
        ? [await current.query()].flat()
        : parent !== undefined
          ? [await current.query(parent)].flat()
          : [];

    for (const currentEl of currentEls) {
      console.log(currentEl);
      if (!currentEl) continue;
      if (current.fn) current.fn(currentEl, "manual");
      this.runRecursive(nextArr, currentEl);
    }
  }

  private isMutationObserverConfig(ob: unknown): ob is MutationObserverInit {
    return (
      typeof ob === "object" &&
      !!ob &&
      ("childList" in ob || "attributes" in ob || "characterData" in ob)
    );
  }
}
