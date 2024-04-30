import { BLOCK_WIDTH } from "../../constants";
import { Face } from "../../constants/block";
import { getNeighbors } from "../helpers/blocksHelpers";
import { getBlocksInChunkFlat } from "./flatWorldGeneration";
import { getBlocksInChunk } from "./worldGeneration";

const { leftZ, rightZ, leftX, rightX, bottom, top } = Face;

type FaceCustom = typeof leftZ | typeof rightZ | typeof leftX | typeof rightX;

self.onmessage = (e) => {
  const { x, z, chunkBlocksCustom, sides } = e.data;

  const { blocksInChunk, boundaries } =
    e.data.type === 1
      ? getBlocksInChunkFlat(x, z, chunkBlocksCustom, sides)
      : getBlocksInChunk(x, z, chunkBlocksCustom, sides);

  const blocksRender: Record<string, 1> = {};

  Object.keys(blocksInChunk).forEach((key) => {
    const { position } = blocksInChunk[key];

    const [x, y, z] = position;

    let shouldRender = true;

    const sideFunc = (side: FaceCustom) => {
      const calFuncMap: Record<FaceCustom, Function> = {
        [leftZ]: () => [
          z == boundaries[side],
          getNeighbors(
            blocksInChunk,
            { x, y, z },
            {
              [leftZ]: false,
              [rightZ]: true,
              [leftX]: true,
              [rightX]: true,
              [bottom]: true,
              [top]: true,
            },
            BLOCK_WIDTH
          ),
        ],
        [rightZ]: () => [
          z == boundaries[side],
          getNeighbors(
            blocksInChunk,
            { x, y, z },
            {
              [leftZ]: true,
              [rightZ]: false,
              [leftX]: true,
              [rightX]: true,
              [bottom]: true,
              [top]: true,
            },
            BLOCK_WIDTH
          ),
        ],

        [leftX]: () => [
          x == boundaries[side],
          getNeighbors(
            blocksInChunk,
            { x, y, z },
            {
              [leftZ]: true,
              [rightZ]: true,
              [leftX]: false,
              [rightX]: true,
              [bottom]: true,
              [top]: true,
            },
            BLOCK_WIDTH
          ),
        ],
        [rightX]: () => [
          x == boundaries[side],
          getNeighbors(
            blocksInChunk,
            { x, y, z },
            {
              [leftZ]: true,
              [rightZ]: true,
              [leftX]: true,
              [rightX]: false,
              [bottom]: true,
              [top]: true,
            },
            BLOCK_WIDTH
          ),
        ],
      };

      const [isBoundaryCal, neighborCondition] = calFuncMap[side]();

      return isBoundaryCal && neighborCondition;
    };

    sides.forEach((side: FaceCustom) => {
      if (sideFunc(side)) {
        shouldRender = false;
      }
    });

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

  self.postMessage({ blocks: blocksInChunk, blocksRender });
};
