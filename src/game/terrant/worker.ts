import { FLAT_WORLD_TYPE } from "../../constants";
import { Face } from "../../constants/block";
import { BlockKeys } from "../../constants/blocks";
import { FlatWorld } from "./flatWorldGeneration";
import { DefaultWorld } from "./worldGeneration";

const { leftZ, rightZ, leftX, rightX, bottom, top } = Face;

self.onmessage = (e) => {
  const { x, z, chunkBlocksCustom, type, seed, neighborsChunkData } =
    e.data as {
      type: number;
      chunkBlocksCustom: Record<string, 0 | BlockKeys>;
      neighborsChunkData: Record<string, Record<string, 0 | BlockKeys>>;
      seed: number;
      x: number;
      z: number;
    };

  const world =
    type === FLAT_WORLD_TYPE
      ? new FlatWorld(chunkBlocksCustom, seed, neighborsChunkData)
      : new DefaultWorld(chunkBlocksCustom, seed, neighborsChunkData);

  world.initialize(x, z);

  const { blocksInChunk, facesToRender } = world;

  self.postMessage({
    blocks: blocksInChunk,
    facesToRender,
  });
};
