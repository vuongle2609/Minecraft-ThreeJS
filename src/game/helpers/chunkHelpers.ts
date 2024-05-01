import { CHUNK_SIZE } from "../../constants/index";

export const getChunkCoordinate = (x: number, z: number) => {
  const chunkCal = CHUNK_SIZE * 2;

  const chunkX = Math.floor(x / chunkCal) || 0;
  const chunkZ = Math.floor(z / chunkCal) || 0;

  return {
    x: chunkX,
    z: chunkZ,
  };
};
