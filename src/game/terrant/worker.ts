import { FLAT_WORLD_TYPE } from "@/constants";
import { nameChunkFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import { FlatWorld } from "./flatWorldGeneration";
import { DefaultWorld } from "./worldGeneration";
import { BlockKeys } from "@/type";

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

  const { facesToRender, arrayBlocksData, typeRenderCount } = world.initialize(
    x,
    z,
    chunkBlocksCustom,
    neighborsChunkData
  );
  const chunkName = nameChunkFromCoordinate(x, z);

  self.postMessage(
    {
      facesToRender,
      chunkName,
      arrayBlocksData,
      typeRenderCount,
    },

    // @ts-ignore
    [arrayBlocksData.buffer]
  );
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
