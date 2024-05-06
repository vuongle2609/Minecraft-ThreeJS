export const $ = <T extends Node = HTMLElement>(selector: string) => {
  return document.querySelector(selector) as unknown as T;
};

export const $$ = <T extends Node = Element>(selector: string) => {
  return document.querySelectorAll(selector) as unknown as NodeListOf<T>;
};
