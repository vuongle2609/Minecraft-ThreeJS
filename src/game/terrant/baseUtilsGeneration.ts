import { BLOCK_WIDTH } from "@/constants";
import { Face } from "@/constants/block";
import { getNeighborsSeparate } from "@/game/helpers/blocksHelpers";
import { detailFromName } from "@/game/helpers/detailFromName";
import { BlockKeys } from "@/type";

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
    chunkBlocksCustom: Record<string, 0 | BlockKeys>
  ) {
    Object.keys(chunkBlocksCustom || {}).forEach((currKey) => {
      const { x, y, z } = detailFromName(currKey);

      blocksInChunk.set(currKey, {
        position: [x, y, z],
        type: chunkBlocksCustom[currKey],
      });
    });
  }

  shouldRenderFace(
    neighBor?: { position: number[]; type: BlockKeys | 0 } | boolean,
    type?: BlockKeys
  ) {
    if (typeof neighBor !== "boolean" && neighBor?.type === BlockKeys.water) {
      // does not handle client face process
      if (type === BlockKeys.water) {
        return false;
      }
      return true;
    }

    if (
      typeof neighBor !== "boolean" &&
      (neighBor?.type as unknown as number) === 0
    ) {
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
    const typeRenderCount = new Map();
    const blockShouldRender: number[] = [];

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

      const valueToSet = {
        [leftZ]: this.shouldRenderFace(faceHasNeighbor?.[leftZ], type),
        [rightZ]: this.shouldRenderFace(faceHasNeighbor?.[rightZ], type),
        [leftX]: this.shouldRenderFace(faceHasNeighbor?.[leftX], type),
        [rightX]: this.shouldRenderFace(faceHasNeighbor?.[rightX], type),
        [bottom]: this.lowestY === y ? false : !faceHasNeighbor?.[bottom],
        [top]: this.shouldRenderFace(faceHasNeighbor?.[top], type),
      };

      const shouldSet = Object.values(valueToSet).filter(Boolean).length;

      if (shouldSet) {
        facesToRender.set(key, valueToSet);
        blockShouldRender.push(...position, type);

        const prevCountValue = typeRenderCount.get(type);

        if (!prevCountValue) {
          typeRenderCount.set(type, {
            [leftZ]: valueToSet[leftZ] ? 1 : 0,
            [rightZ]: valueToSet[rightZ] ? 1 : 0,
            [leftX]: valueToSet[leftX] ? 1 : 0,
            [rightX]: valueToSet[rightX] ? 1 : 0,
            [bottom]: valueToSet[bottom] ? 1 : 0,
            [top]: valueToSet[top] ? 1 : 0,
          });
        } else {
          typeRenderCount.set(type, {
            [leftZ]: prevCountValue[leftZ] + 1,
            [rightZ]: prevCountValue[rightZ] + 1,
            [leftX]: prevCountValue[leftX] + 1,
            [rightX]: prevCountValue[rightX] + 1,
            [bottom]: prevCountValue[bottom] + 1,
            [top]: prevCountValue[top] + 1,
          });
        }
      }
    }

    return { facesToRender, typeRenderCount, blockShouldRender };
  }
}
