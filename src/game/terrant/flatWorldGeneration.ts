import { BLOCK_WIDTH, CHUNK_SIZE, FLAT_WORLD_HEIGHT } from "../../constants";
import { BlockKeys } from "../../constants/blocks";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";
import { BaseGeneration } from "./baseUtilsGeneration";

export class FlatWorld extends BaseGeneration {
  constructor(seed: number) {
    super(seed);
  }

  getBlocksInChunk(
    x: number,
    z: number,
    chunkBlocksCustom: Record<string, 0 | BlockKeys>
  ) {
    const blocksInChunk: Record<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = {};
    let isFirstLayer = true;

    const blocksInChunkTypeOnly: Record<string, BlockKeys | 0> = {};

    for (let yA = FLAT_WORLD_HEIGHT - 1; yA >= 0; yA--) {
      for (let xA = x * CHUNK_SIZE; xA < (x + 1) * CHUNK_SIZE; xA++) {
        for (let zA = z * CHUNK_SIZE; zA < (z + 1) * CHUNK_SIZE; zA++) {
          const position = [
            xA * BLOCK_WIDTH,
            yA * BLOCK_WIDTH || 0,
            zA * BLOCK_WIDTH,
          ];

          this.lowestY =
            this.lowestY === undefined
              ? position[1]
              : position[1] < this.lowestY
              ? position[1]
              : this.lowestY;

          const blockName = nameFromCoordinate(
            position[0],
            position[1],
            position[2]
          );

          let shouldAssignBlock = true;

          if (chunkBlocksCustom?.[blockName] == 0) {
            shouldAssignBlock = false;
            blocksInChunkTypeOnly[blockName] = 0;
          }

          if (shouldAssignBlock) {
            const type = isFirstLayer ? "grass" : "dirt";
            blocksInChunk[blockName] = {
              position,
              type,
            };
            blocksInChunkTypeOnly[blockName] = type;
          }
        }
      }
      isFirstLayer = false;
    }

    const { mergedBlocksInChunk, mergedBlocksInChunkTypeOnly } =
      this.mergeBlocks(blocksInChunk, chunkBlocksCustom, blocksInChunkTypeOnly);

    return {
      blocksInChunk: mergedBlocksInChunk,
      blocksInChunkTypeOnly: mergedBlocksInChunkTypeOnly,
    };
  }

  initialize(
    x: number,
    z: number,
    chunkBlocksCustom: Record<string, 0 | BlockKeys>,
    neighborsChunkData: Record<string, Record<string, 0 | BlockKeys>>
  ) {
    const { blocksInChunk } = this.getBlocksInChunk(x, z, chunkBlocksCustom);

    const blocksInChunkNeighbor = Object.keys(neighborsChunkData).reduce(
      (prev, key) => {
        const [x, z] = key.split("_");

        const { blocksInChunkTypeOnly } = this.getBlocksInChunk(
          Number(x),
          Number(z),
          (neighborsChunkData || {})[key]
        );

        return {
          ...prev,
          ...blocksInChunkTypeOnly,
        };
      },
      {}
    );

    const facesToRender = this.calFaceToRender(
      blocksInChunk,
      blocksInChunkNeighbor
    );

    return {
      facesToRender,
      blocksInChunk,
    };
  }
}
