type TagName = keyof HTMLElementTagNameMap;
type Primitive = boolean | string | number;

type ElAttrs<T extends TagName, E = HTMLElementTagNameMap[T]> = {
  id?: string;
  classes?: (string | false | undefined)[];
  onChange?: (e: Event) => void;
  onSubmit?: (e: Event) => void;
  type?: E extends HTMLButtonElement ? E["type"] : never;
  href?: E extends HTMLAnchorElement ? string : never;
  htmlFor?: E extends HTMLLabelElement ? string : never;
  value?: E extends HTMLTextAreaElement
    ? string
    : E extends HTMLInputElement
      ? Primitive | undefined
      : never;
};

export type Child = HTMLElement | string | false | undefined;
export type Children = Child[];
type ElAttrsWithChildren<T extends TagName> = ElAttrs<T> & {
  children?: Children;
};

function addAttrs<T extends TagName>(
  e: HTMLElementTagNameMap[T],
  attrs: ElAttrs<T>,
) {
  if (attrs.id) e.id = attrs.id;
  if (attrs.classes) {
    e.classList.add(...attrs.classes.filter((c): c is string => !!c));
  }
  if (attrs.onChange) e.addEventListener("change", attrs.onChange);
  if (attrs.onSubmit) e.addEventListener("submit", attrs.onSubmit);

  if (e instanceof HTMLAnchorElement) {
    if (attrs.href) {
      e.href = attrs.href;
      e.target = "_blank";
      e.rel = "noopener noreferrer";
    }
  }

  if (e instanceof HTMLLabelElement) {
    if (attrs.htmlFor) e.htmlFor = attrs.htmlFor;
  }

  if (e instanceof HTMLInputElement && attrs.value !== undefined) {
    if (typeof attrs.value === "boolean") {
      e.type = "checkbox";
      e.checked = attrs.value;
    }
    if (typeof attrs.value === "string") {
      e.type = "text";
      e.value = attrs.value;
    }
    if (typeof attrs.value === "number") {
      e.type = "number";
      e.value = `${attrs.value}`;
    }
  }

  if (e instanceof HTMLTextAreaElement) {
    if (attrs.value && typeof attrs.value === "string") {
      e.value = attrs.value;
    }
  }
}

export function el<T extends TagName>(
  tagName: T,
  attrs: ElAttrsWithChildren<T> = {},
) {
  const e = document.createElement(tagName);
  addAttrs(e, attrs);
  if (attrs.children) {
    e.append(...attrs.children.filter((c): c is HTMLElement | string => !!c));
  }
  return e;
}
