import { BLOCK_WIDTH } from "../../constants";
import { Face } from "../../constants/block";
import { BlockKeys } from "../../constants/blocks";
import { getNeighborsSeparate } from "../helpers/blocksHelpers";
import { detailFromName } from "../helpers/detailFromName";

const { leftZ, rightZ, leftX, rightX, bottom, top } = Face;

export class BaseGeneration {
  blocksInChunk: Record<
    string,
    {
      position: number[];
      type: BlockKeys;
    }
  > = {};

  chunkBlocksCustom: Record<string, 0 | BlockKeys>;
  neighborsChunkData: Record<string, Record<string, 0 | BlockKeys>>;
  seed: number;

  neiborsBlocksCustom = () =>
    Object.values(this.neighborsChunkData).reduce((prev, data) => {
      return {
        ...prev,
        ...data,
      };
    }, {});
  facesToRender: Record<string, Record<Face, boolean>>;

  lowestY: number;

  constructor(
    chunkBlocksCustom: Record<string, 0 | BlockKeys>,
    seed: number,
    neighborsChunkData: Record<string, Record<string, 0 | BlockKeys>>
  ) {
    this.chunkBlocksCustom = chunkBlocksCustom;
    this.neighborsChunkData = neighborsChunkData;
    this.seed = seed;
  }

  // merge existing or deleted blocks with generated blocks
  mergeBlocks() {
    this.blocksInChunk = {
      ...this.blocksInChunk,
      ...Object.keys(this.chunkBlocksCustom).reduce((prev, currKey) => {
        const { x, y, z } = detailFromName(currKey);

        if (this.chunkBlocksCustom[currKey] == 0) {
          return prev;
        }

        return {
          ...prev,
          [currKey]: {
            position: [x, y, z],
            type: this.chunkBlocksCustom[currKey],
          },
        };
      }, {}),
    };
  }

  calFaceToRender(
    blocksInChunkNeighbor: Record<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = {}
  ) {
    const blockExisting = {
      ...this.blocksInChunk,
      ...blocksInChunkNeighbor,
    };

    this.facesToRender = Object.keys(this.blocksInChunk).reduce<
      Record<string, Record<Face, boolean>>
    >((prev, key) => {
      const { position } = this.blocksInChunk[key];

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
  }
}
