export const getRound = (num: number) =>
  Math.round(num) % 2 ? Math.round(num) + 1 : Math.round(num);
