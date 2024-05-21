export const throttle = (func: Function, delay: number) => {
  let shouldExecute = true;

  return (...agr: any) => {
    if (!shouldExecute) return;

    func(...agr);
    shouldExecute = false;

    setTimeout(() => {
      shouldExecute = true;
    }, delay);
  };
};
