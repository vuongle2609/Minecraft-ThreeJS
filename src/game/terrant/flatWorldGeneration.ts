import { BLOCK_WIDTH, CHUNK_SIZE, FLAT_WORLD_HEIGHT } from "../../constants";
import { BlockKeys } from "../../constants/blocks";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";
import { BaseGeneration } from "./baseUtilsGeneration";

export class FlatWorld extends BaseGeneration {
  constructor(
    chunkBlocksCustom: Record<string, 0 | BlockKeys>,
    seed: number,
    neighborsChunkData: Record<string, Record<string, 0 | BlockKeys>>
  ) {
    super(chunkBlocksCustom, seed, neighborsChunkData);
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
          }

          if (shouldAssignBlock) {
            blocksInChunk[blockName] = {
              position,
              type: isFirstLayer ? "grass" : "dirt",
            };
          }
        }
      }
      isFirstLayer = false;
    }

    return blocksInChunk;
  }

  initialize(x: number, z: number) {
    const blocksInChunk = this.getBlocksInChunk(x, z, this.chunkBlocksCustom);

    const blocksInChunkNeighbor = Object.keys(this.neighborsChunkData).reduce(
      (prev, key) => {
        const [x, z] = key.split("_");

        return {
          ...prev,
          ...this.getBlocksInChunk(
            Number(x),
            Number(z),
            this.neighborsChunkData[key]
          ),
        };
      },
      {}
    );
    this.blocksInChunk = blocksInChunk;

    this.mergeBlocks();

    this.calFaceToRender(blocksInChunkNeighbor);
  }
}
