import { getBlocksInChunkFlat } from "./flatWorldGeneration";
import { getBlocksInChunk } from "./worldGeneration";

self.onmessage = (e) => {
  const blocks =
    e.data.type === 1
      ? getBlocksInChunkFlat(e.data.x, e.data.z)
      : getBlocksInChunk(e.data.x, e.data.z);

  self.postMessage({ blocks });
};
