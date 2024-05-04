import { CHUNK_SIZE } from '../../constants/index';

export const getChunkCoordinate = (
  x: number,
  z: number,
  chunkSize?: number
) => {
  const chunkCal = (chunkSize || CHUNK_SIZE) * 2;

  const chunkX = Math.floor(x / chunkCal) || 0;
  const chunkZ = Math.floor(z / chunkCal) || 0;

  return {
    x: chunkX,
    z: chunkZ,
  };
};

export const getChunkNeighborsCoor = (x: number, z: number) => {
  const mappingNeighbors: Record<string, { x: number; z: number }> = {};

  const variants: number[] = [];

  for (let num = 0; num <= 1; num++) {
    if (num == 0) variants.push(num);
    else {
      variants.push(num);
      variants.push(-num);
    }
  }

  variants.forEach((num) => {
    variants.forEach((num1) => {
      const coor = { x: num + x, z: num1 + z };
      if (
        !mappingNeighbors[coor.x + "_" + coor.z] &&
        Math.abs(num) !== Math.abs(num1)
      ) {
        mappingNeighbors[coor.x + "_" + coor.z] = coor;
      }
    });
  });

  return mappingNeighbors;
};
