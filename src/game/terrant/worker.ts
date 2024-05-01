import { BLOCK_WIDTH, FLAT_WORLD_TYPE } from "../../constants";
import { Face } from "../../constants/block";
import { getNeighbors } from "../helpers/blocksHelpers";
import { getBlocksInChunkFlat } from "./flatWorldGeneration";
import { getBlocksInChunk } from "./worldGeneration";

const { leftZ, rightZ, leftX, rightX, bottom, top } = Face;

self.onmessage = (e) => {
  const { x, z, chunkBlocksCustom, type, seed } = e.data;

  const { blocksInChunk, boundaries } =
    type === FLAT_WORLD_TYPE
      ? getBlocksInChunkFlat(x, z, chunkBlocksCustom, seed)
      : getBlocksInChunk(x, z, chunkBlocksCustom, seed);

  const blocksRender: Record<string, 1> = {};

  Object.keys(blocksInChunk).forEach((key) => {
    const { position } = blocksInChunk[key];

    const [x, y, z] = position;

    let shouldRender = true;

    if (
      y == boundaries.lowestY &&
      getNeighbors(
        blocksInChunk,
        { x, y, z },
        {
          [leftZ]: true,
          [rightZ]: true,
          [leftX]: true,
          [rightX]: true,
          [bottom]: false,
          [top]: true,
        },
        BLOCK_WIDTH
      )
    ) {
      shouldRender = false;
    }

    if (
      getNeighbors(
        blocksInChunk,
        { x, y, z },
        {
          [leftZ]: true,
          [rightZ]: true,
          [leftX]: true,
          [rightX]: true,
          [bottom]: true,
          [top]: true,
        },
        BLOCK_WIDTH
      )
    ) {
      shouldRender = false;
    }

    if (shouldRender) {
      blocksRender[key] = 1;
    }
  });

  self.postMessage({
    blocks: blocksInChunk,
    blocksRender,
  });
};
