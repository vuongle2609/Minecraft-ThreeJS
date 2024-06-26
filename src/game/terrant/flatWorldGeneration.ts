import { BLOCK_WIDTH, CHUNK_SIZE, FLAT_WORLD_HEIGHT } from "@/constants";
import { nameFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import { BlockKeys } from "@/type";
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
    const blocksInChunk: Map<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = new Map();

    let isFirstLayer = true;

    for (let yA = FLAT_WORLD_HEIGHT - 1; yA >= 0; yA--) {
      for (let xA = x * CHUNK_SIZE; xA < (x + 1) * CHUNK_SIZE; xA++) {
        for (let zA = z * CHUNK_SIZE; zA < (z + 1) * CHUNK_SIZE; zA++) {
          const position = [
            xA * BLOCK_WIDTH,
            yA * BLOCK_WIDTH || 0,
            zA * BLOCK_WIDTH,
          ];

          const blockName = nameFromCoordinate(
            position[0],
            position[1],
            position[2]
          );

          let shouldAssignBlock = true;

          if (chunkBlocksCustom?.[blockName] === 0) {
            shouldAssignBlock = false;
          }

          if (shouldAssignBlock) {
            let type = isFirstLayer ? BlockKeys.grass : BlockKeys.dirt;

            if (!yA) {
              type = BlockKeys.bedrock;
            }

            blocksInChunk.set(blockName, {
              position,
              type: type,
            });
          }
        }
      }
      isFirstLayer = false;
    }

    this.mergeBlocks(blocksInChunk, chunkBlocksCustom);

    return {
      blocksInChunk,
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

        const { blocksInChunk } = this.getBlocksInChunk(
          Number(x),
          Number(z),
          (neighborsChunkData || {})[key]
        );

        return new Map([...prev, ...blocksInChunk]);
      },
      new Map()
    );

    const { facesToRender, blockOcclusion } = this.calFaceToRender(
      blocksInChunk,
      blocksInChunkNeighbor
    );

    const arrayBlocksDataTmp: number[] = [];

    for (const [_key, { position, type }] of blocksInChunk) {
      arrayBlocksDataTmp.push(...position, type);
    }

    const arrayBlocksData = Int32Array.from(arrayBlocksDataTmp);

    return {
      facesToRender: Object.fromEntries(facesToRender),
      arrayBlocksData,
      blockOcclusion: Object.fromEntries(blockOcclusion),
    };
  }
}
