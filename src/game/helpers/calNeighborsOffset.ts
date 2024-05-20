export const calNeighborsOffset = (stack: number) => {
  const mappingNeighbors: Record<string, { x: number; z: number }> = {};

  const variants: number[] = [];

  for (let num = 0; num <= stack; num++) {
    if (num === 0) variants.push(num);
    else {
      variants.push(num);
      variants.push(-num);
    }
  }

  variants.forEach((num) => {
    variants.forEach((num1) => {
      if (!mappingNeighbors[num + "_" + num1]) {
        mappingNeighbors[num + "_" + num1] = {
          x: num,
          z: num1,
        };
      }
    });
  });

  return Object.values(mappingNeighbors);
};
