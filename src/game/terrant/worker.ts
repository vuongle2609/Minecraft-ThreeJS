import { FLAT_WORLD_TYPE } from '../../constants';
import { BlockKeys } from '../../constants/blocks';
import { FlatWorld } from './flatWorldGeneration';
import { DefaultWorld } from './worldGeneration';

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
    type === FLAT_WORLD_TYPE ? new FlatWorld(seed) : new DefaultWorld(seed);

  const { blocksInChunk, facesToRender } = world.initialize(
    x,
    z,
    chunkBlocksCustom,
    neighborsChunkData
  );

  self.postMessage({
    blocks: blocksInChunk,
    facesToRender,
  });
};
