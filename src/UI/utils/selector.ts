export const $ = (selector: string) => {
  return document.querySelector(selector) as HTMLElement;
};

export const $$ = <T extends Node = Element>(selector: string) => {
  return document.querySelectorAll(selector) as unknown as NodeListOf<T>;
};
