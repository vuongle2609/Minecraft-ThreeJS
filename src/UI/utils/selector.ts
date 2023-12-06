export const $ = (selector: string) => {
  return document.querySelector(selector) as HTMLElement;
};

export const $$ = (selector: string) => {
  return document.querySelectorAll(selector);
};
