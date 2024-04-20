import nameFromCoordinate from "./nameFromCoordinate";

const getChunkCoordinate = (x: number, y: number) => {
  const chunkSize = 16;
  const chunkCal = chunkSize * 2;

  const chunkX = Math.floor(x / chunkCal);
  const chunkY = Math.floor(y / chunkCal);

  return {
    x: chunkX,
    y: chunkY,
  };
};

const getBlocksInChunk = (x: number, y: number) => {
  const chunkSize = 16;
  const blocksInChunk: Record<string, null> = {};

  for (let xA = x * chunkSize; xA < (x + 1) * chunkSize; xA++) {
    for (let yA = y * chunkSize; yA < (y + 1) * chunkSize; yA++) {
      blocksInChunk[nameFromCoordinate(xA * 2, 0, yA * 2)] = null;
    }
  }

  return blocksInChunk;
};

export default getChunkCoordinate;
