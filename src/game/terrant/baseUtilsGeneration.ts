import { BLOCK_WIDTH } from "../../constants";
import { Face } from "../../constants/block";
import { BlockKeys } from "../../constants/blocks";
import { getNeighborsSeparate } from "../helpers/blocksHelpers";
import { detailFromName } from "../helpers/detailFromName";

const { leftZ, rightZ, leftX, rightX, bottom, top } = Face;

export class BaseGeneration {
  seed: number;

  lowestY: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // merge existing or deleted blocks with generated blocks
  mergeBlocks(
    blocksInChunk: Map<
      string,
      {
        position: number[];
        type: BlockKeys | 0;
      }
    > = new Map(),
    chunkBlocksCustom: Record<string, 0 | BlockKeys>,
    blocksInChunkTypeOnly: Map<string, BlockKeys | 0>
  ) {
    Object.keys(chunkBlocksCustom || {}).forEach((currKey) => {
      const { x, y, z } = detailFromName(currKey);

      if (chunkBlocksCustom[currKey] == 0) {
        blocksInChunkTypeOnly.set(currKey, 0);
      }

      blocksInChunkTypeOnly.set(currKey, chunkBlocksCustom[currKey]);

      blocksInChunk.set(currKey, {
        position: [x, y, z],
        type: chunkBlocksCustom[currKey],
      });
    });
  }

  shouldRenderFace(
    neighBor?: { position: number[]; type: BlockKeys } | boolean,
    type?: BlockKeys
  ) {
    if (typeof neighBor !== "boolean" && neighBor?.type === "water") {
      // does not handle client face process
      if (type === "water") {
        return false;
      }
      return true;
    }

    return !neighBor;
  }

  calFaceToRender(
    blocksInChunk: Map<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = new Map(),
    blocksInChunkNeighbor: Map<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = new Map()
  ) {
    const blockExisting = new Map([...blocksInChunk, ...blocksInChunkNeighbor]);

    Object.keys(blocksInChunk);

    const facesToRender = new Map();

    for (let [key, value] of blocksInChunk) {
      const { position, type } = value;

      const [x, y, z] = position;

      const faceHasNeighbor = getNeighborsSeparate(
        blockExisting,
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
      );

      facesToRender.set(key, {
        [leftZ]: this.shouldRenderFace(faceHasNeighbor?.[leftZ], type),
        [rightZ]: this.shouldRenderFace(faceHasNeighbor?.[rightZ], type),
        [leftX]: this.shouldRenderFace(faceHasNeighbor?.[leftX], type),
        [rightX]: this.shouldRenderFace(faceHasNeighbor?.[rightX], type),
        [bottom]: this.lowestY === y ? false : !faceHasNeighbor?.[bottom],
        [top]: this.shouldRenderFace(faceHasNeighbor?.[top], type),
      });
    }

    return facesToRender;
  }
}
