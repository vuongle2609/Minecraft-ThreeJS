import { CHUNK_SIZE, FLAT_WORLD_HEIGHT } from "../../constants";
import blocks from "../../constants/blocks";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";

export const getBlocksInChunkFlat = (x: number, z: number) => {
  const blocksInChunk: Record<
    string,
    {
      position: number[];
      type: keyof typeof blocks;
    }
  > = {};

  for (let yA = 0; yA < FLAT_WORLD_HEIGHT; yA++) {
    for (let xA = x * CHUNK_SIZE; xA < (x + 1) * CHUNK_SIZE; xA++) {
      for (let zA = z * CHUNK_SIZE; zA < (z + 1) * CHUNK_SIZE; zA++) {
        const position = [xA * 2, yA * -2 || 0, zA * 2];

        const blockName = nameFromCoordinate(
          position[0],
          position[1],
          position[2]
        );

        blocksInChunk[blockName] = {
          position,
          type: position[1] ? "dirt" : "grass",
        };
      }
    }
  }

  return blocksInChunk;
};
