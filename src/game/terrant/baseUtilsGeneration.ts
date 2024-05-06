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
    blocksInChunk: Record<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = {},
    chunkBlocksCustom: Record<string, 0 | BlockKeys>,
    blocksInChunkTypeOnlyTerrant: Record<string, BlockKeys | 0>
  ) {
    const blocksInChunkTypeOnly: Record<string, BlockKeys | 0> = {
      ...blocksInChunkTypeOnlyTerrant,
    };

    const mergedBlocksInChunk: Record<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = ({} = {
      ...blocksInChunk,
      ...Object.keys(chunkBlocksCustom || {}).reduce((prev, currKey) => {
        const { x, y, z } = detailFromName(currKey);

        if (chunkBlocksCustom[currKey] == 0) {
          blocksInChunkTypeOnly[currKey] = 0;
          return prev;
        }

        blocksInChunkTypeOnly[currKey] = chunkBlocksCustom[currKey];
        return {
          ...prev,
          [currKey]: {
            position: [x, y, z],
            type: chunkBlocksCustom[currKey],
          },
        };
      }, {}),
    });

    return {
      mergedBlocksInChunk,
      mergedBlocksInChunkTypeOnly: blocksInChunkTypeOnly,
    };
  }

  calFaceToRender(
    blocksInChunk: Record<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = {},
    blocksInChunkNeighbor: Record<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = {}
  ) {
    const blockExisting = {
      ...blocksInChunk,
      ...blocksInChunkNeighbor,
    };

    const facesToRender = Object.keys(blocksInChunk).reduce<
      Record<string, Record<Face, boolean>>
    >((prev, key) => {
      const { position } = blocksInChunk[key];

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

      return {
        ...prev,
        [key]: {
          [leftZ]: !faceHasNeighbor?.[leftZ],
          [rightZ]: !faceHasNeighbor?.[rightZ],
          [leftX]: !faceHasNeighbor?.[leftX],
          [rightX]: !faceHasNeighbor?.[rightX],
          [bottom]: this.lowestY === y ? false : !faceHasNeighbor?.[bottom],
          [top]: !faceHasNeighbor?.[top],
        },
      };
    }, {});

    return facesToRender;
  }
}
