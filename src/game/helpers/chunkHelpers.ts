import { CHUNK_SIZE } from "@/constants/index";
import nameFromCoordinate from "./nameFromCoordinate";

const getChunkCoordinate = (x: number, y: number) => {
  const CHUNK_SIZE = 16;
  const chunkCal = CHUNK_SIZE * 2;

  const chunkX = Math.floor(x / chunkCal);
  const chunkY = Math.floor(y / chunkCal);

  return {
    x: chunkX,
    y: chunkY,
  };
};

const getBlocksInChunk = (x: number, y: number) => {
  const CHUNK_SIZE = 16;
  const blocksInChunk: Record<string, null> = {};

  for (let xA = x * CHUNK_SIZE; xA < (x + 1) * CHUNK_SIZE; xA++) {
    for (let yA = y * CHUNK_SIZE; yA < (y + 1) * CHUNK_SIZE; yA++) {
      blocksInChunk[nameFromCoordinate(xA * 2, 0, yA * 2)] = null;
    }
  }

  return blocksInChunk;
};

export default getChunkCoordinate;
