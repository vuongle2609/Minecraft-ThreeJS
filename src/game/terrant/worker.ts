import { Face } from "../../constants/block";
import { BLOCK_WIDTH } from "../../constants";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";
import { getBlocksInChunkFlat } from "./flatWorldGeneration";

const { leftZ, rightZ, leftX, rightX } = Face;

type FaceCustom = typeof leftZ | typeof rightZ | typeof leftX | typeof rightX;

self.onmessage = (e) => {
  const { x, z, chunkBlocksCustom, sides } = e.data;

  // const blocks =
  //   e.data.type === 1
  //     ? getBlocksInChunkFlat(e.data.x, e.data.z, e.data.chunkBlocksCustom)
  //     : getBlocksInChunk(e.data.x, e.data.z);

  const { blocksInChunk, boundaries } = getBlocksInChunkFlat(
    x,
    z,
    chunkBlocksCustom,
    sides
  );

  const blocksHasNeibors: Record<string, 1> = {};

  Object.keys(blocksInChunk).forEach((key) => {
    const { position } = blocksInChunk[key];

    const [x, y, z] = position;

    let shouldRender = true;

    // if (boundaries)

    const sideFunc = (side: FaceCustom) => {
      const calFuncMap: Record<FaceCustom, Function> = {
        [leftZ]: () =>
          z == boundaries[side] &&
          blocksInChunk[nameFromCoordinate(x, y, z + BLOCK_WIDTH)] &&
          blocksInChunk[nameFromCoordinate(x + BLOCK_WIDTH, y, z)] &&
          blocksInChunk[nameFromCoordinate(x - BLOCK_WIDTH, y, z)] &&
          blocksInChunk[nameFromCoordinate(x, y + BLOCK_WIDTH, z)] &&
          blocksInChunk[nameFromCoordinate(x, y - BLOCK_WIDTH, z)],
        [rightZ]: () =>
          z == boundaries[side] &&
          blocksInChunk[nameFromCoordinate(x, y, z - BLOCK_WIDTH)] &&
          blocksInChunk[nameFromCoordinate(x + BLOCK_WIDTH, y, z)] &&
          blocksInChunk[nameFromCoordinate(x - BLOCK_WIDTH, y, z)] &&
          blocksInChunk[nameFromCoordinate(x, y + BLOCK_WIDTH, z)] &&
          blocksInChunk[nameFromCoordinate(x, y - BLOCK_WIDTH, z)],

        [leftX]: () =>
          x == boundaries[side] &&
          blocksInChunk[nameFromCoordinate(x, y, z + BLOCK_WIDTH)] &&
          blocksInChunk[nameFromCoordinate(x, y, z - BLOCK_WIDTH)] &&
          blocksInChunk[nameFromCoordinate(x + BLOCK_WIDTH, y, z)] &&
          blocksInChunk[nameFromCoordinate(x, y + BLOCK_WIDTH, z)] &&
          blocksInChunk[nameFromCoordinate(x, y - BLOCK_WIDTH, z)],
        [rightX]: () =>
          x == boundaries[side] &&
          blocksInChunk[nameFromCoordinate(x, y, z + BLOCK_WIDTH)] &&
          blocksInChunk[nameFromCoordinate(x, y, z - BLOCK_WIDTH)] &&
          blocksInChunk[nameFromCoordinate(x - BLOCK_WIDTH, y, z)] &&
          blocksInChunk[nameFromCoordinate(x, y + BLOCK_WIDTH, z)] &&
          blocksInChunk[nameFromCoordinate(x, y - BLOCK_WIDTH, z)],
      };

      return calFuncMap[side]();
    };

    sides.forEach((side: FaceCustom) => {
      if (sideFunc(side)) {
        // shouldRender = false;
      }
    });

    if (
      y == boundaries.lowestY &&
      blocksInChunk[nameFromCoordinate(x, y, z + BLOCK_WIDTH)] &&
      blocksInChunk[nameFromCoordinate(x, y, z - BLOCK_WIDTH)] &&
      blocksInChunk[nameFromCoordinate(x + BLOCK_WIDTH, y, z)] &&
      blocksInChunk[nameFromCoordinate(x - BLOCK_WIDTH, y, z)] &&
      blocksInChunk[nameFromCoordinate(x, y + BLOCK_WIDTH, z)]
    ) {
      shouldRender = false;
    }

    if (
      blocksInChunk[nameFromCoordinate(x, y, z + BLOCK_WIDTH)] &&
      blocksInChunk[nameFromCoordinate(x, y, z - BLOCK_WIDTH)] &&
      blocksInChunk[nameFromCoordinate(x + BLOCK_WIDTH, y, z)] &&
      blocksInChunk[nameFromCoordinate(x - BLOCK_WIDTH, y, z)] &&
      blocksInChunk[nameFromCoordinate(x, y + BLOCK_WIDTH, z)] &&
      blocksInChunk[nameFromCoordinate(x, y - BLOCK_WIDTH, z)]
    ) {
      shouldRender = false;
    }

    if (shouldRender) {
      blocksHasNeibors[key] = 1;
    }
  });

  // console.log(blocksHasNeibors)

  self.postMessage({ blocks: blocksInChunk, blocksToRender: blocksHasNeibors });
};
