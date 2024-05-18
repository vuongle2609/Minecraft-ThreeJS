import { FLAT_WORLD_TYPE } from "@/constants";
// import { BlockKeys } from "@/type";
import { nameChunkFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import { FlatWorld } from "./flatWorldGeneration";
import { DefaultWorld } from "./worldGeneration";

export enum BlockKeys {
  grass = 1,
  bedrock = 2,
  stone = 3,
  sand = 4,
  dirt = 5,
  cobblestone = 6,
  leaves = 7,
  wood = 8,
  furnace = 9,
  oakPlanks = 10,
  blockOfDiamond = 11,
  blockOfIron = 12,
  blockOfGold = 13,
  blockOfLapis = 14,
  blockOfEmerald = 15,
  water = 16,
}

const getBlocksInChunk = ({
  x,
  z,
  chunkBlocksCustom,
  type,
  seed,
  neighborsChunkData,
}: {
  type: number;
  chunkBlocksCustom: Record<string, 0 | BlockKeys>;
  neighborsChunkData: Record<string, Record<string, 0 | BlockKeys>>;
  seed: number;
  x: number;
  z: number;
}) => {
  const world =
    type === FLAT_WORLD_TYPE ? new FlatWorld(seed) : new DefaultWorld(seed);

  const { blocksInChunk, facesToRender } = world.initialize(
    x,
    z,
    chunkBlocksCustom,
    neighborsChunkData
  );
  const chunkName = nameChunkFromCoordinate(x, z);

  self.postMessage({
    type: "renderBlocks",
    data: {
      blocks: blocksInChunk,
      facesToRender,
      chunkName,
    },
  });
};

let eventMapping: Record<string, Function> = {
  getBlocksInChunk,
};

self.onmessage = (
  e: MessageEvent<{
    type: keyof typeof eventMapping;
    data: any;
  }>
) => {
  eventMapping[e.data.type]?.(e.data.data);
};
