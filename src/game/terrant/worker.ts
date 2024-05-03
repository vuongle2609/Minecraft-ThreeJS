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

  const { blocksInChunk, facesToRender } =
    type === FLAT_WORLD_TYPE
      ? new FlatWorld(x, z, chunkBlocksCustom, seed, neighborsChunkData)
      : new DefaultWorld(x, z, chunkBlocksCustom, seed, neighborsChunkData);

  self.postMessage({
    blocks: blocksInChunk,
    facesToRender,
  });
};
